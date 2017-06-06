angular.module("casserole")
.controller("ProduccionCtrl", ProduccionCtrl);  
function ProduccionCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	this.ventas = [];
	window.rc = rc;
	
	this.subscribe('ventas',()=>{
		return [{estatusPago : 2, estatus: {$in : [1, 2]}, sucursal_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
  });
  
  this.subscribe("usuariosProduccion");
  //todo hola mundo
  this.helpers({
	  ventas : () => {
		  return Ventas.find({},{sort : {"entrega.fecha" : -1}}).fetch();
	  },
	  productores : () => {
		  return Meteor.users.find({roles : ["produccion"]});
	  },
	  listaProduccion : () => {
		  var listado = [];
		  if(this.getReactively("ventas")){
			  _.each(this.getReactively("ventas"), function(venta){
				  _.each(venta.detalle, function(detalle){
					  //detalle.cliente = venta.clienteSeleccionado.nombre;
					  detalle.claseEstatus = rc.obtenerEstatus(detalle.estatus);
					  detalle.venta_id = venta._id;
					  detalle.fechaEntrega = venta.entrega.fecha;
					  detalle.fechaTermino = moment(venta.entrega.fecha).add(-1, "hours").toDate();
					  detalle.tipoEnvio = venta.tipoEnvio;
					  detalle.mensajeComentario = venta.entrega.mensajeComentario;
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
  
  //Es cuando un productor toma un arreglo
  this.elegirProductor = function(arreglo, productor){
	  var venta = Ventas.findOne(arreglo.venta_id);
		venta.estatus = 2;
		delete venta._id;
	  arreglo.estatus = 2;
	  arreglo.tomado = true;
	  arreglo.produccion = {};
	  arreglo.produccion.nombre = productor.profile.nombre;
	  arreglo.produccion.productor_id = productor._id;
	  arreglo.produccion.fecha = new Date();
	  venta.detalle[arreglo._id - 1] = arreglo;
	  Ventas.update(
		  { _id: arreglo.venta_id},
			{ $set: venta }
	  );
	  BitacoraProduccion.insert({
		  usuario_id : Meteor.userId(),
		  rol : Meteor.user().roles[0],
		  venta_id : arreglo.venta_id,
		  arreglo_id : arreglo._id,
		  fechaCreacion : new Date(),
		  estatus : arreglo.estatus
	  })
	  toastr.info("Ha tomando un nuevo arreglo");
  }
  
  this.terminar = function(arreglo){
	  var venta = Ventas.findOne(arreglo.venta_id);
	  arreglo.estatus = 3;
	  arreglo.tomado = false;
	  venta.detalle[arreglo._id - 1] = arreglo;
	  delete venta._id;
	  Ventas.update(
		  { _id: arreglo.venta_id},
			{ $set: venta }
	  );
	  BitacoraProduccion.insert({
		  usuario_id : Meteor.userId(),
		  rol : Meteor.user().roles[0],
		  venta_id : arreglo.venta_id,
		  arreglo_id : arreglo._id,
		  fechaCreacion : new Date(),
		  estatus : arreglo.estatus
	  })
	  var estaTerminado = true;
	  _.each(venta.detalle, function(arreglo){
		  if(arreglo.estatus != 3){
			  estaTerminado = false;
		  }
	  });
	  
	  if(estaTerminado){
		  Ventas.update(
		  	{_id : arreglo.venta_id},
		  	{$set : { estatus : 3}}
		  )
	  }
	  toastr.success("Ha terminado un arreglo");
  }
  
  this.cancelar = function(arreglo){
	  var venta = Ventas.findOne(arreglo.venta_id);
	  delete venta._id;
	  delete arreglo.produccion;
	  arreglo.estatus = 1;
	  arreglo.tomado = false;
	  venta.detalle[arreglo._id - 1] = arreglo;
	  Ventas.update(
		  { _id: arreglo.venta_id},
			{ $set: venta }
	  );
	  BitacoraProduccion.insert({
		  usuario_id : Meteor.userId(),
		  rol : Meteor.user().roles[0],
		  venta_id : arreglo.venta_id,
		  arreglo_id : arreglo._id,
		  fechaCreacion : new Date(),
		  estatus : arreglo.estatus
	  })
	  var estaTerminado = true;
	  _.each(venta.detalle, function(arreglo){
		  if(arreglo.estatus == 2 || arreglo.estatus == 1){
			  estaTerminado = false;
		  }
	  });
	  
	  if(estaTerminado == false){
		  Ventas.update(
		  	{_id : arreglo.venta_id},
		  	{$set : { estatus : 1}}
		  )
	  }
	  toastr.warning("Ha cancelado el arreglo");
  }
  
  this.noTerminada = function(arreglo){
	  var venta = Ventas.findOne(arreglo.venta_id);
	  delete venta._id;
	  arreglo.estatus = 2;
	  arreglo.tomado = true;
	  venta.detalle[arreglo._id - 1] = arreglo;
	  Ventas.update(
		  { _id: arreglo.venta_id },
			{ $set: venta }
	  );
	  BitacoraProduccion.insert({
		  usuario_id : Meteor.userId(),
		  rol : Meteor.user().roles[0],
		  venta_id : arreglo.venta_id,
		  arreglo_id : arreglo._id,
		  fechaCreacion : new Date(),
		  estatus : arreglo.estatus
	  })
	  var estaTerminado = true;
	  _.each(venta.detalle, function(arreglo){
		  if(arreglo.estatus == 2 || arreglo.estatus == 1){
			  estaTerminado = false;
		  }
	  });
	  
	  if(estaTerminado == false){
		  Ventas.update(
		  	{ _id : arreglo.venta_id },
		  	{ $set : { estatus : 1 }}
		  )
	  }
	  toastr.warning("Ha recuperado el arreglo para ponerlo en proceso nuevamente");
  }
  
  //Validar si tiene foto el productor
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
  };
  
  this.tieneFotoProductorArreglo = function(productor_id){
	  var productor = Meteor.users.findOne(productor_id);
	  if(productor)
		  return this.tieneFoto(productor.profile.sexo, productor.profile.fotografia);
  }
  
  this.duracion = function(fecha){
	  var hoy = moment();
	  var inicie = moment(fecha);
		return inicie.from(hoy);
  }
};