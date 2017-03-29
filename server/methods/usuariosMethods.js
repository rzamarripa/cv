Meteor.methods({
/*
  createUsuario: function (usuario, rol) {
  	usuario.contrasena = Math.random().toString(36).substring(2,7);
	  profile = {
				email: usuario.correo,
				nombre: usuario.nombre,
				apellidos: usuario.apPaterno + " " + usuario.apMaterno,
				nombreCompleto : usuario.nombre  + " " + usuario.apPaterno + " " + (usuario.apMaterno ? usuario.apMaterno : ""),
				fotografia : usuario.fotografia,
				sexo : usuario.sexo,
				estatus:true,
				campus_id : usuario.campus_id,
				seccion_id : usuario.seccion_id
			}
		if(usuario.maestro_id != undefined)
			profile.maestro_id = usuario.maestro_id;
		
		var usuario_id = Accounts.createUser({
			username: usuario.nombreUsuario,
			password: usuario.contrasena,
			profile: profile
		});
		
		Roles.addUsersToRoles(usuario_id, rol);
		Meteor.call('sendEmail',
			profile.email,
			'sistema@casserole.edu.mx',
			'Bienvenido a Casserole',
			'Usuario: '+ usuario.nombreUsuario + ' contraseña: '+ usuario.contrasena
		);
		return usuario_id;
	},
*/
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
		console.log(usuario);
		usuario.contrasena = Math.random().toString(36).substring(2,7);
		usuario.profile.pwd = usuario.contrasena;
	  usuario.profile.friends = [];
	  console.log(usuario);
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
	buscarClientes : function(options){
		if(options.where.nombreCompleto.length > 0){
			var semanaActual = moment().isoWeek();
			
			let selector = {
		  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
		  	roles : ["cliente"]
			}
			
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
		return obtenerEstatusNombre(estatus);
	},
	getAlumnosPorEstatus : function(fechaInicio, fechaFin, estatus, seccion_id){
		var estatusNombre = obtenerEstatusNombre(estatus);
		var bitacoras = BitacoraEstatus.find({fechaCreacion : { $gte : fechaInicio, $lt : fechaFin}, estatusActual : parseInt(estatus), seccion_id : seccion_id}).fetch();
		if(bitacoras.length > 0){
			_.each(bitacoras, function(bitacora){
				bitacora.alumno = Meteor.users.findOne({_id : bitacora.alumno_id}, { fields : {"profile.nombreCompleto" : 1, "profile.matricula" : 1, "profile.estatus" : 1, "profile.estatusObj" : 1}});
				bitacora.estatusNombre = estatusNombre;
			})
		}
		return bitacoras;
	},
	getCantClientesPorEstatus : function(fechaInicio, fechaFin, estatus, seccion_id){
		
		var bitacoras = BitacoraEstatus.find({fechaCreacion : { $gte : fechaInicio, $lt : fechaFin}, seccion_id : seccion_id}).fetch();
		
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
	if(estatus == 1){ //Registrado
	  var estatusNombre = "Registrado";
  }else if(estatus == 2){
	  var estatusNombre = "Inicio";
  }else if(estatus == 3){
	  var estatusNombre = "Inicio Pospuesto";
  }else if(estatus == 4){
	  var estatusNombre = "Fantasma";
  }else if(estatus == 5){
	  var estatusNombre = "Activo";
  }else if(estatus == 6){
	  var estatusNombre = "Baja";
  }else if(estatus == 7){
	  var estatusNombre = "Terminación de Pago";
  }else if(estatus == 8){
	  var estatusNombre = "Egresado";
  }
  
  return estatusNombre;
}

function obtenerColorEstatus(estatus){
	if(estatus == 1){
	  return "#57889c";
  }else if(estatus == 2){
	  return "#6e587a";
  }else if(estatus == 3){
	  return "#b09b5b";
  }else if(estatus == 4){
	  return "#92a2a8";
  }else if(estatus == 5){
	  return "#71843f";
  }else if(estatus == 6){
	  return "#a90329";
  }else if(estatus == 7){
	  return "#4c4f53";
  }else if(estatus == 8){
	  return "blue";
  }
}