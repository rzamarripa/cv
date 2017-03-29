angular.module("casserole")
.controller("ProduccionCtrl", ProduccionCtrl);  
function ProduccionCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	this.ventas = [];
	window.rc = rc;
	
	this.subscribe('ventas',()=>{
		return [{estatus:1, sucursal_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
  });
  
  this.helpers({
	  ventas : () => {
		  return Ventas.find().fetch();
	  },
	  listaProduccion : () => {
		  var listado = [];
		  if(this.getReactively("ventas")){
			  _.each(this.getReactively("ventas"), function(venta){
				  _.each(venta.detalle, function(detalle){
					  detalle.cliente = venta.clienteSeleccionado.nombre;
					  detalle.claseEstatus = rc.obtenerEstatus(detalle.estatus);
					  detalle.venta_id = venta._id;
					  listado.push(detalle);
				  })
			  })
		  }
		  return listado;
	  }
  });
  
  this.obtenerEstatus = function(estatus){
	  if(estatus == 1){
		  return "pendiente";
	  }else if(estatus == 2){
		  return "tomado";
	  }else if(estatus == 3){
		  return "terminado";
	  }
  }
  
  this.tomar = function(arreglo){
	  var venta = Ventas.findOne(arreglo.venta_id);
	  console.log(arreglo);
	  arreglo.estatus = 2;
	  arreglo.tomado = true;
	  arreglo.produccion = arreglo.produccion || {};
	  arreglo.produccion.nombre = Meteor.user().profile.nombre;
	  arreglo.produccion.productor_id = Meteor.userId();
	  arreglo.produccion.fecha = new Date();
	  venta.detalle[arreglo._id - 1] = arreglo;
	  Ventas.update(
		  { _id: arreglo.venta_id},
			{ $set: venta }
	  );
	  BitacoraProduccion.insert({
		  productor_id : Meteor.userId(),
		  venta_id : arreglo.venta_id,
		  arreglo_id : arreglo._id,
		  fechaCreacion : new Date(),
		  arreglo.estatus
	  })
	  toastr.info("Ha tomando un nuevo arreglo");
  }
  
  this.terminar = function(arreglo){
	  var venta = Ventas.findOne(arreglo.venta_id);
	  arreglo.estatus = 3;
	  arreglo.tomado = false;
	  venta.detalle[arreglo._id - 1] = arreglo;
	  Ventas.update(
		  { _id: arreglo.venta_id},
			{ $set: venta }
	  );
	  BitacoraProduccion.insert({
		  productor_id : Meteor.userId(),
		  venta_id : arreglo.venta_id,
		  arreglo_id : arreglo._id,
		  fechaCreacion : new Date(),
		  arreglo.estatus
	  })
	  toastr.success("Ha terminado un arreglo");
  }
  
  this.cancelar = function(arreglo){
	  var venta = Ventas.findOne(arreglo.venta_id);
	  arreglo.estatus = 3;
	  arreglo.tomado = false;
	  venta.detalle[arreglo._id - 1] = arreglo;
	  Ventas.update(
		  { _id: arreglo.venta_id},
			{ $set: venta }
	  );
	  BitacoraProduccion.insert({
		  productor_id : Meteor.userId(),
		  venta_id : arreglo.venta_id,
		  arreglo_id : arreglo._id,
		  fechaCreacion : new Date(),
		  arreglo.estatus
	  })
	  toastr.warning("Ha cancelado el arreglo");
  }
  
};