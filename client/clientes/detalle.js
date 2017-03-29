angular
	.module('casserole')
	.controller('ClientesDetalleCtrl', ClientesDetalleCtrl);
 
function ClientesDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	
	
	this.cliente = {};
	this.fechaActual = new Date();
	window.rc = rc;

	this.subscribe("ocupaciones",()=>{
		return [{_id : this.getReactively("ocupacion_id"), estatus : true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('cliente', () => {
		return [{
			id : $stateParams.cliente_id
		}];
	});
	
	this.subscribe("mediosPublicidad",()=>{
		return [{estatus:true }]
	});
		
	this.helpers({
		cliente : () => {
			var cl = Meteor.users.findOne({_id : $stateParams.cliente_id});
			if(cl){
				this.ocupacion_id = cl.profile.ocupacion_id;
				return cl;
			}
			return cl;
		},
		ocupaciones : () => {
			return Ocupaciones.find();
		},
		mediosPublicidad : () => {
			return MediosPublicidad.find();
		}
	});
	
	this.actualizar = function(alumno,form){
		var alumnoTemp = Meteor.users.findOne({_id : alumno._id});
		this.alumno.password = alumnoTemp.password;
		this.alumno.repeatPassword = alumnoTemp.password;
		//document.getElementById("contra").value = this.alumno.password;

		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = alumno.profile.nombre != undefined ? alumno.profile.nombre + " " : "";
		var apPaterno = alumno.profile.apPaterno != undefined ? alumno.profile.apPaterno + " " : "";
		var apMaterno = alumno.profile.apMaterno != undefined ? alumno.profile.apMaterno : "";
		alumno.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		delete alumno.profile.repeatPassword;
		Meteor.call('updateGerenteVenta', rc.alumno, "alumno");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go('root.alumnos');
	};
	
	this.tomarFoto = function () {
		$meteor.getPicture().then(function(data){
			rc.alumno.profile.fotografia = data;
		});
	};
		
	this.masInformacion = function(){
		this.masInfo = !this.masInfo;
	}

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

	this.obtenerEstatus = function(cobro){

		if(cobro.estatus == 1){
			return "bg-color-green txt-color-white";
		}			
		if(cobro.estatus == 5 || cobro.tmpestatus==5)
			return "bg-color-blue txt-color-white";
		else if(cobro.estatus == 0 && (cobro.semana >= this.semanaPago && cobro.anio >= this.anioActual)){
			
		}
		else if(cobro.estatus == 3){
			return "bg-color-blueDark txt-color-white";	
		}
		else if(cobro.estatus == 2){
			return "bg-color-red txt-color-white";
		}
		else if(cobro.estatus == 6)
			return "bg-color-greenLight txt-color-white";
		else if(cobro.tiempoPago == 1 || cobro.anio < this.anioActual || (cobro.semana < this.semanaPago && cobro.anio == this.anioActual)){
			return "bg-color-orange txt-color-white";
		}
				
		return "";
		
	}
	
	this.getOcupacion = function(ocupacion_id){
		var ocupacion = Ocupaciones.findOne(ocupacion_id);
		if(ocupacion)
			return ocupacion.nombre;
	};
  	
	this.guardarComentario = function(alumno_id){
		semanaActual = moment(new Date()).isoWeek();
		diaActual = moment(new Date()).isoWeekday();
		this.comentario.fechaCreacion = new Date();
		this.comentario.estatus = true;
		this.comentario.usuarioInserto_id = Meteor.userId();
		this.comentario.alumno_id = alumno_id;
		this.comentario.semana = semanaActual;
		this.comentario.dia = diaActual;
		
		ComentariosAlumnos.insert(this.comentario);
		this.comentario = {};
		toastr.success('Guardado correctamente.');
	}
	
	this.tienePermiso = function(roles){
		permiso = false;
		_.each(roles, function(role){
			if(role == Meteor.user().roles[0]){
				permiso = true;
			}
		});
		
		return permiso;
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
	  if(estatus == 1){ //Registrado
		  return "Registrado";
	  }else if(estatus == 2){
		  return "Inicio"
	  }else if(estatus == 3){
		  return "Pospuesto"
	  }else if(estatus == 4){
		  return "Fantasma"
	  }else if(estatus == 5){
		  return "Activo"
	  }else if(estatus == 6){
		  return "Baja"
	  }else if(estatus == 7){
		  return "Term.Pago"
	  }else if(estatus == 8){
		  return "Egresado"
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