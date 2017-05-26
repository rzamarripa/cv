angular.module("casserole")
.controller("SolicitudesCtrl", SolicitudesCtrl);  
function SolicitudesCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	
	window.rc = rc;
  this.ventaSeleccionada = {}
  this.clientes_ids = [];
  this.saldoTotal = 0.00;
  this.pagadoTotal = 0.00;
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,59,59);
  
  if(Meteor.user() && Meteor.user().roles[0] == "matriz"){
	  rc.sucursales_ids = [];
	  rc.subscribe('sucursales',()=>{
			return [{_id : { $in : {}}}] 
	  });
  }else{
	  rc.subscribe('sucursales',()=>{
			return [{_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
	  });
  }
	
	this.subscribe('solicitudes',()=>{
		return [{ sucursal_id : Meteor.user() ? Meteor.user().profile.sucursal_id : "",
			$or : [
				{ fechaCreacion : { $gte : rc.getReactively("fechaInicial"), $lt: rc.getReactively("fechaFinal")} },
				{ estatus : 1 },
				{	estatus : 2 }
			]}]
  });
	
  this.subscribe('unidades',()=>{
		return [{estatus:true}] 
  });
  
  this.subscribe('usuarios',()=>{
		return [{_id : { $in : this.getCollectionReactively("clientes_ids")}}]; 
  });
  
	this.helpers({
	  solicitudes : () => {
		  var solicitudes = Solicitudes.find().fetch();
		  _.each(solicitudes, function(solicitud){
			  rc.clientes_ids.push(solicitud.usuario_id);
			  (Meteor.user().roles[0] == 'matriz') ? rc.sucursales_ids.push(solicitud.sucursal_id) : "";
			  solicitud.sucursal = Sucursales.findOne({_id : solicitud.sucursal_id});
			  solicitud.usuario = Meteor.users.findOne(solicitud.usuario_id);
		  });
		  actualizar();
		  return solicitudes;
	  }
  });
  
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
  
  this.ver = function(solicitud_id){
	  $state.go("root.verSolicitud",{ solicitud_id : solicitud_id});
  }
  
  this.cambiarEstatus = function(id, estatus){
	  Solicitudes.update({_id : id}, { $set : { estatus : estatus }});
	  if(estatus == 2)
		  toastr.info("Se ha enviado el pedido");
		else if(estatus == 3)
			toastr.success("Se ha recibido el pedido");
		else if(estatus == 4)
			toastr.error("Se ha cancelado el pedido");
  }
  
  function actualizar(){
	  if(Meteor.user().roles[0] == 'matriz'){
		  Meteor.apply("cantidadSolicitudes", [rc.fechaInicial, rc.fechaFinal], function(error, result){
			  if(result){
				  rc.cantidadPendientes = result[0];
				  rc.cantidadEnviadas = result[1];
				  rc.cantidadEntregadas = result[2];
				  rc.cantidadCanceladas = result[3];
				  $scope.$apply();
			  }
		  })
	  }else{
		  Meteor.apply("cantidadSolicitudesSucursal", [rc.fechaInicial, rc.fechaFinal, Meteor.user().profile.sucursal_id], function(error, result){
			  if(result){
				  rc.cantidadPendientes = result[0];
				  rc.cantidadEnviadas = result[1];
				  rc.cantidadEntregadas = result[2];
				  rc.cantidadCanceladas = result[3];
				  $scope.$apply();
			  }
		  })
	  }
	  
  }
  
  
  
};