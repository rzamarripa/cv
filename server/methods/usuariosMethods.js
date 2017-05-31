Meteor.methods({
	createGerenteVenta: function (usuario, rol) {	  
	  usuario.profile.friends = [];
	  
		if(usuario.maestro_id != undefined)
			profile.maestro_id = usuario.maestro_id;
		
		var usuario_id = Accounts.createUser({
			username: usuario.username,
			password: usuario.password,			
			profile: usuario.profile
		});
		
		Roles.addUsersToRoles(usuario_id, rol);
		
		return usuario_id;
		
	},
	updateGerente: function (usuario, rol) {		
		var usuarioViejo = Meteor.users.findOne({"profile.sucursal_id" : usuario.profile.sucursal_id});
		var idTemp = usuarioViejo._id;
	  Meteor.users.update({_id: idTemp}, {$set:{
			username: usuario.username,
			roles: [rol],
			profile: usuario.profile
		}});
		
		Accounts.setPassword(idTemp, usuario.password, {logout: false});		
	},
	sendEmail: function (to, from, subject, text) {
    this.unblock();
    Email.send({
      to: to,
      from: from,
      subject: subject,
      text: text
    });
  },
	userIsInRole: function(usuario, rol, grupo, vista){
		if (!Roles.userIsInRole(usuario, rol, grupo)) {
	    throw new Meteor.Error(403, "Usted no tiene permiso para entrar a " + vista);
	  }
	},
	createUsuario: function (usuario, rol) {
		usuario.contrasena = Math.random().toString(36).substring(2,7);
		usuario.profile.pwd = usuario.contrasena;
	  usuario.profile.friends = [];

		var usuario_id = Accounts.createUser({
			username: usuario.username,
			password: usuario.contrasena,
			profile: usuario.profile
		});
		
		Roles.addUsersToRoles(usuario_id, rol);
		Meteor.call('sendEmail',
			usuario.profile.correo,
			'sistema@corazonvioleta.mx',
			'Bienvenido a Corazón de Violeta',
			'Usuario: '+ usuario.username + ' contraseña: ' + usuario.contrasena
		);
		return usuario_id;
	},
	updateUsuario: function (usuario, rol) {		
		var user = Meteor.users.findOne(usuario._id);
	  Meteor.users.update({_id: user._id}, {$set:{
			username: usuario.username,
			roles: [rol],
			profile: usuario.profile
		}});
		
		Accounts.setPassword(user._id, usuario.password, {logout: false});		
	},
	buscarClientes : function(options){
		if(options.where.nombreCompleto.length > 0){
			var semanaActual = moment().isoWeek();
			
			let selector = {
		  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
		  	roles : ["cliente"]
			}
			console.log(selector)
			var clientes = Meteor.users.find(selector, options.options).fetch();	
			_.each(clientes, function(cliente){
				cliente.profile.region = Regiones.findOne(cliente.profile.region_id);
				cliente.profile.sucursal = Sucursales.findOne(cliente.profile.sucursal_id);
			});
		}
		return clientes;
	},
	cambiarEstatusCliente : function(cliente_id, estatus, classLabel, estatusNombre, sucursal_id){
		
		var cliente = Meteor.users.findOne({ _id : cliente_id});
		var diaSemana = moment().isoWeekday();
		var dia = moment().date();
		var semana = moment().isoWeek();
		var mes = moment().month() + 1;
		var anio = moment().year();
		
		BitacoraEstatus.insert({cliente_id : cliente_id, estatusAnterior : parseInt(cliente.profile.estatus), estatusActual : parseInt(estatus), fechaCreacion : new Date(), diaSemana : diaSemana, dia : dia, semana : semana, mes : mes, anio : anio, sucursal_id : sucursal_id });
		Meteor.users.update({_id : cliente_id}, {$set : {"profile.semanaEstatus " : moment().isoWeek(), "profile.estatus" : estatus, "profile.estatusObj.classLabel" : classLabel, "profile.estatusObj.nombre" : estatusNombre, "profile.estatusObj.codigo" : estatus}});
		return estatus;
	},
	getClientesPorEstatus : function(fechaInicio, fechaFin, estatus, sucursal_id){		
		if(estatus == "0"){
			var clientes = Meteor.users.find({createdAt : { $gte : fechaInicio, $lt : fechaFin}, "profile.sucursal_id" : sucursal_id, roles : ["cliente"]}, {profile : 1, "profile.fotografia" : 0}).fetch();
		}else{		
			var clientes = Meteor.users.find({createdAt : { $gte : fechaInicio, $lt : fechaFin}, "profile.estatus" : estatus, "profile.sucursal_id" : sucursal_id, roles : ["cliente"]}, {profile : 1, "profile.fotografia" : 0}).fetch();
		}
		
		if(clientes.length > 0){
			_.each(clientes, function(cliente){
				cliente.profile.estatusNombre = obtenerEstatusNombre(cliente.profile.estatus);
				cliente.profile.estatusColor = obtenerColorEstatus(cliente.profile.estatus);
			})
		}

		return clientes;
	},
	getCantClientesPorEstatus : function(fechaInicio, fechaFin, estatus, sucursal_id){
		
		if(estatus == "0"){
			console.log("entré");
			var bitacoras = BitacoraEstatus.find({fechaCreacion : { $gte : fechaInicio, $lt : fechaFin}, sucursal_id : sucursal_id}).fetch();
		}else{
			var bitacoras = BitacoraEstatus.find({fechaCreacion : { $gte : fechaInicio, $lt : fechaFin}, estatusActual : parseInt(estatus), sucursal_id : sucursal_id}).fetch();
		}
		
		fechaInicio = moment(fechaInicio);
		fechaFin = moment(fechaFin);
		
		var semanas = [];
		while (fechaFin > fechaInicio) {
		   semanas.push(fechaInicio.isoWeek());
		   fechaInicio = fechaInicio.day(8);
		}
		
		var elementos = [];
		for(i = 0; i < semanas.length; i++){
			elementos.push(0);
		}
		
		var cantBitacoras = {};
		if(bitacoras.length > 0){
			_.each(bitacoras, function(bitacora){
				if(cantBitacoras[bitacora.estatusActual] == undefined){
					cantBitacoras[bitacora.estatusActual] = {};
					cantBitacoras[bitacora.estatusActual].name = obtenerEstatusNombre(bitacora.estatusActual);
					cantBitacoras[bitacora.estatusActual].data = elementos.slice();
					cantBitacoras[bitacora.estatusActual].color = obtenerColorEstatus(bitacora.estatusActual);
					cantBitacoras[bitacora.estatusActual].data[bitacora.semana - semanas[0]] = 1;
				}else{
					cantBitacoras[bitacora.estatusActual].data[bitacora.semana - semanas[0]] += 1;
				}
			})
		}

		cantBitacoras = _.toArray(cantBitacoras);
		
		return [semanas, cantBitacoras, bitacoras];

	}
});

function obtenerEstatusNombre(estatus){
	var estatusNombre = "";
	if(estatus == "1"){ //Registrado
	  var estatusNombre = "Registrado";
  }else if(estatus == "2"){
	  var estatusNombre = "Activo";
  }else if(estatus == "3"){
	  var estatusNombre = "Preferente";
  }else if(estatus == "4"){
	  var estatusNombre = "Baja";
  }
  
  return estatusNombre;
}

function obtenerColorEstatus(estatus){
	var result = "";
	  if(estatus == 1){
		  result = "bg-color-blue txt-white";
	  }else if(estatus == 2){
		  result = "bg-color-purple txt-white"
	  }else if(estatus == 3){
		  result = "bg-color-greenLight txt-white"
	  }else if(estatus == 4){
		  result = "bg-color-red txt-white"
	  }else if(estatus == 5){
		  result = "bg-color-greenLight txt-white"
	  }
	  return result;
}