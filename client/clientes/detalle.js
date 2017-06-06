angular
	.module('casserole')
	.controller('ClientesDetalleCtrl', ClientesDetalleCtrl);
 
function ClientesDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	
	this.cliente = {};
	this.fechaActual = new Date();
	this.masInfo = false; 
	this.ocupacion_id = "";
	this.medio_id = "";
	this.comentario = {};
	window.rc = rc;

	this.subscribe("ocupaciones",()=>{
		return [{_id : this.getReactively("ocupacion_id"), estatus : true }]
	});
	
	this.subscribe("ventas",()=>{
		return [{cliente_id : this.getReactively("cliente._id")}]
	});
	
	this.subscribe("mediosPublicidad",()=>{
		return [{_id : this.getReactively("medio_id"), estatus : true }]
	});
	
	this.subscribe('cliente', () => {
		return [{
			id : $stateParams.cliente_id
		}];
	});
	
	this.helpers({
		cliente : () => {
			var cl = Meteor.users.findOne({_id : $stateParams.cliente_id});
			if(cl){
				this.ocupacion_id = cl.profile.ocupacion_id;
				this.medio_id = cl.profile.medio_id;
				cl.profile.ocupacion = Ocupaciones.findOne(cl.profile.ocupacion_id);
				cl.profile.medio = MediosPublicidad.findOne(cl.profile.medio_id)
				return cl;
			}
			return cl;
		},
		compras : () => {
			return Ventas.find();
		}
	});
	
	this.actualizar = function(cliente,form){
		var clienteTemp = Meteor.users.findOne({_id : cliente._id});
		this.cliente.password = clienteTemp.password;
		this.cliente.repeatPassword = clienteTemp.password;
		//document.getElementById("contra").value = this.alumno.password;

		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = cliente.profile.nombre != undefined ? cliente.profile.nombre + " " : "";
		var apPaterno = cliente.profile.apPaterno != undefined ? cliente.profile.apPaterno + " " : "";
		var apMaterno = cliente.profile.apMaterno != undefined ? cliente.profile.apMaterno : "";
		cliente.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		delete cliente.profile.repeatPassword;
		Meteor.call('updateGerenteVenta', rc.cliente, "alumno");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
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
		
	this.obtenerColorEstatus = function(estatus){
	  if(estatus == 1){ //Registrado
		  return "bg-color-blue txt-white";
	  }else if(estatus == 2){
		  return "bg-color-purple txt-white"
	  }else if(estatus == 3){
		  return "bg-color-yellow txt-white"
	  }else if(estatus == 4){
		  return "bg-color-blueLight txt-white"
	  }else if(estatus == 5){
		  return "bg-color-greenLight txt-white"
	  }else if(estatus == 6){
		  return "bg-color-red txt-white"
	  }else if(estatus == 7){
		  return "bg-color-blueDark txt-white"
	  }else if(estatus == 8){
		  return "label-primary txt-white"
	  }
  }
  
  this.obtenerNombreEstatus = function(estatus){
	  if(estatus == 1){
		  return "Pendiente";
	  }else if(estatus == 2){
		  return "En Proceso";
	  }else if(estatus == 3){
		  return "Terminado";
	  }else if(estatus == 4){
		  return "Enviado";
	  }else if(estatus == 5){
		  return "Entregado";
	  }
  }
  
  this.getEstatusNombrePago = function(estatus){
	  if(estatus == 0){
		  return "Sin anticipo";
	  }else if(estatus == 1){
		  return "Abonado";
	  }else if(estatus == 2){
		  return "Pagado";
	  }else if(estatus == 3){
		  return "Cancelado";
	  } 
  }
  
  this.cambiarEstatus = function(estatus, classLabel){
	  Meteor.apply("cambiarEstatusCliente", [rc.cliente._id, estatus, this.obtenerColorEstatus(estatus), this.obtenerNombreEstatus(estatus), Meteor.user().profile.sucursal_id], function(error, result){
		  if(result){
			  toastr.success("El cliente se ha cambiado al estatus " + result);
		  }else{
			  toastr.error("No se pudo cambiar el estatus");
		  }
	  })
  }
}