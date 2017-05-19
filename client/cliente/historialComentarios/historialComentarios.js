angular
	.module('casserole')
	.controller('HistorialComentariosCtrl', HistorialComentariosCtrl);
 
function HistorialComentariosCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);

	this.comentario = {};
	this.fechaActual = new Date();
	this.diaActual = moment(new Date()).weekday();
	this.semanaActual = moment(new Date()).isoWeek();
	this.usuarios_id = [];
	
	this.subscribe('cliente', () => {
		return [{
			id : $stateParams.cliente_id
		}];
	});

	this.subscribe("comentariosCliente",() => {
		return [{ cliente_id : $stateParams.cliente_id }];
	});
	
	this.subscribe("usuarios",() => {
		return [{sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", _id : { $in : this.getCollectionReactively("usuarios_id")}}];
	});
	
	this.helpers({
		cliente : () => {
			return Meteor.users.findOne({_id : $stateParams.cliente_id}); 
		},
		comentarios : () => {
			var comentarios = ComentariosCliente.find().fetch();
			_.each(comentarios, function(comentario){
			  rc.usuarios_id.push(comentario.usuarioInserto_id);
			  comentario.usuarioInserto = Meteor.users.findOne({},{fields : {"profile.nombreCompleto" : 1}}) 
		  });
		  			
			return comentarios;
		}		
	});
	
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
	
	this.obtenerColorEstatus = function(estatus){
	  if(estatus == 1){ //Registrado
		  return "bg-color-blue txt-white";
	  }else if(estatus == 2){
		  return "bg-color-purple txt-white"
	  }else if(estatus == 3){
		  return "bg-color-greenLight txt-white"
	  }else if(estatus == 4){
		  return "bg-color-red txt-white"
	  }
  }
  
  this.obtenerNombreEstatus = function(estatus){
	  if(estatus == 1){
		  return "Registrado";
	  }else if(estatus == 2){
		  return "Activo";
	  }else if(estatus == 3){
		  return "Preferente";
	  }else if(estatus == 4){
		  return "Baja";
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
	
}