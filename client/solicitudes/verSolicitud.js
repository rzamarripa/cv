angular.module("casserole")
.controller("VerSolicitudCtrl", VerSolicitudCtrl);  
function VerSolicitudCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	
	window.rc = rc;
	
	this.solicitud_id = $stateParams.solicitud_id;
	this.folioSolicitud = "";
	
	if(Meteor.user().roles[0] == "matriz"){
		this.subscribe('solicitudes',()=>{
			return [{ $or : [{ _id : this.getReactively("solicitud_id")},{folio : this.getReactively("folioSolicitud")}]}] 
	  });
	}else{
		this.subscribe('solicitudes',()=>{
			return [{sucursal_id : Meteor.user() ? Meteor.user().profile.sucursal_id : "",  $or : [{ _id : this.getReactively("solicitud_id")},{folio : this.getReactively("folioSolicitud")}]}] 
	  });
	}	
	
  this.subscribe('unidades',()=>{
		return [{estatus:true}] 
  });
  
  this.subscribe('sucursales',()=>{
		return [{ _id : this.getReactively("solicitud.sucursal_id")}] 
  });
  
  this.subscribe("usuarios", () => {
	  return [{_id : this.getReactively("solicitud.usuario_id")}]
  })
  
	this.helpers({
	  solicitud : () => {
		  var solicitud = Solicitudes.findOne();
		  if(solicitud){
			  solicitud.sucursal = Sucursales.findOne();
				solicitud.usuario = Meteor.users.findOne(solicitud.usuario_id);
		  }		  
		  return solicitud;
	  }
  });
  
  this.cambiarEstatus = function(estatus){
	  console.log(estatus);
	  Solicitudes.update({_id : rc.solicitud._id}, { $set : { estatus : estatus }});
	  if(estatus == 2)
		  toastr.info("Se ha enviado el pedido");
		else if(estatus == 3)
			toastr.success("Se ha recibido el pedido");
		else if(estatus == 4)
			toastr.error("Se ha cancelado el pedido");
  }
  
  this.getEstatusNombre = function(estatus){
	  if(estatus == 1){
		  return "Pendiente";
	  }else if(estatus == 2){
		  return "Enviado";
	  }else if(estatus == 3){
		  return "Entregado";
	  }else if(estatus == 4){
		  return "Cancelado";
	  } 
  }
  
  this.buscarSolicitud = function(folio){
	  console.log(folio);
	  this.solicitud_id = "";
	  this.folioSolicitud = parseInt(folio);
  }
};