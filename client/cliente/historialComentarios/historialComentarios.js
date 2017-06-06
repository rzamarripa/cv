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
	
}