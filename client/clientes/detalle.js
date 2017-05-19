angular
	.module('casserole')
	.controller('ClientesDetalleCtrl', ClientesDetalleCtrl);
 
function ClientesDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams, Estatus) {
	
	rc = $reactive(this).attach($scope);
	
	this.cliente = {};
	this.fechaActual = new Date();
	this.masInfo = false; 
	this.ocupacion_id = "";
	this.medio_id = "";
	this.comentario = {};
	this.sucursales_ids = [];
	window.rc = rc;

	this.subscribe("ocupaciones",()=>{
		return [{ estatus : true }]
	});
	
	this.subscribe("ventas",()=>{
		return [{cliente_id : this.getReactively("cliente._id")}]
	});
	
	this.subscribe("sucursales", () => {
		return [{_id : { $in : this.getCollectionReactively("sucursales_ids")}}]
	})
	
	this.subscribe("mediosPublicidad",()=>{
		return [{ estatus : true }]
	});
	
	this.subscribe('cliente', () => {
		return [{
			id : $stateParams.cliente_id
		}];
	});
	
	this.getEstatusNombreColor = function(estatus){
	  return Estatus.getEstatusNombreColor(estatus, function(err, message){
		  if(message)
			  return message;
	  });
  }
	
	this.helpers({
		cliente : () => {
			var cl = Meteor.users.findOne({_id : $stateParams.cliente_id});
			if(cl){
				this.ocupacion_id = cl.profile.ocupacion_id;
				this.medio_id = cl.profile.medio_id;
				cl.profile.ocupacion = Ocupaciones.findOne(cl.profile.ocupacion_id);
				cl.profile.medio = MediosPublicidad.findOne(cl.profile.medio_id);
				cl.estatusNombreColor = rc.getEstatusNombreColor(cl.profile.estatus);
				return cl;
			}
			return cl;
		},
		compras : () => {
			var compras = Ventas.find().fetch();
			if(compras)
				this.sucursales_ids = _.pluck(compras, "sucursal_id");
			_.each(compras, function(compra){
				compra.sucursal = Sucursales.findOne(compra.sucursal_id);
			})
			return compras;
		},
		ocupaciones : () => {
			return Ocupaciones.find();
		},
		mediosPublicidad : () => {
			return MediosPublicidad.find();
		}
	});
	
	this.actualizar = function(cliente,form){
		var clienteTemp = Meteor.users.findOne({_id : cliente._id});
		this.cliente.password = clienteTemp.password;
		this.cliente.repeatPassword = clienteTemp.password;

		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		
		var nombre = cliente.profile.nombre != undefined ? cliente.profile.nombre + " " : "";
		var apPaterno = cliente.profile.apPaterno != undefined ? cliente.profile.apPaterno + " " : "";
		var apMaterno = cliente.profile.apMaterno != undefined ? cliente.profile.apMaterno : "";
		cliente.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		delete cliente.profile.repeatPassword;
		Meteor.call('updateUsuario', rc.cliente, "cliente");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		$state.go('root.clientes');
	};
	
	this.tomarFoto = function () {
		$meteor.getPicture().then(function(data){
			rc.cliente.profile.fotografia = data;
		});
	};

	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "masculino")
				return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
		}else{
			return foto;
		}
	}
	  	
	this.guardarComentario = function(cliente_id){
		semanaActual = moment(new Date()).isoWeek();
		diaActual = moment(new Date()).isoWeekday();
		this.comentario.fechaCreacion = new Date();
		this.comentario.estatus = true;
		this.comentario.usuarioInserto_id = Meteor.userId();
		this.comentario.cliente_id = cliente_id;
		this.comentario.semana = semanaActual;
		this.comentario.dia = diaActual;
		
		ComentariosCliente.insert(this.comentario);
		this.comentario = {};
		toastr.success('Guardado correctamente.');
	}

  this.getEstatusNombre = function(estatus){
	  return Estatus.getEstatusNombre(estatus, function(err, result){
		  return result;
	  });
  }
  
  this.getEstatusNombreProceso = function(estatus){
	  return Estatus.getEstatusNombreProceso(estatus, function(err, result){
		  return result;
	  });
  }
  
  this.getEstatusNombrePago = function(estatus){
	  return Estatus.getEstatusNombrePago(estatus, function(err, result){
		  return result;
	  });
  }
  
  this.cambiarEstatus = function(estatus, classLabel){
	  Meteor.apply("cambiarEstatusCliente", [
	  	rc.cliente._id, estatus, 
	  	this.getEstatusNombreColor(estatus), 
	  	this.getEstatusNombre(estatus), 
	  	Meteor.user().profile.sucursal_id], function(error, result){
		  if(result){
			  return Estatus.getEstatusNombre(estatus, function(err, result){
				  toastr.success("El cliente se ha cambiado al estatus " + result);
				  return result;
			  });
		  }else{
			  toastr.error("No se pudo cambiar el estatus");
		  }
	  })
  }
}