angular.module("casserole")
.controller("RepartidorCtrl", RepartidorCtrl);  
function RepartidorCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	this.ventas = [];
	this.fechaInicio = new Date();
	this.fechaInicio.setHours(0,0,0,0);
	this.fechaFin = new Date();
	this.fechaFin.setHours(23,59,59,0);
	this.postitSeleccionado = {};
	this.altoSeleccionado = 0;
	window.rc = rc;
	
	this.subscribe('ventas',()=>{
		return [{estatus: {$in : [3,4,5]}, sucursal_id : Meteor.user() ? Meteor.user().profile.sucursal_id : "", tipoEnvio : "Envio"}];
  });
  
  this.subscribe("usuariosProduccion");
  
  this.helpers({
	  ventas : () => {
		  return Ventas.find({},{sort : {"entrega.fecha" : -1}}).fetch();
	  },
	  repartidor : () =>{
		  return Meteor.user();
	  },
	  repartidores : () => {
		  return Meteor.users.find({roles : ["repartidor"]});
	  },
	  listaRepartoHoy : () => {
		  var listado = [];
		  var ventas = Ventas.find({"entrega.fecha" : { $gte : rc.fechaInicio, $lt : rc.fechaFin }, estatus : 3}).fetch()
		  if(ventas){
			  _.each(ventas, function(venta){
				  _.each(venta.detalle, function(detalle){
					  if(detalle.estatus == 3){
						  detalle.cliente = venta.clienteSeleccionado.nombre;
						  detalle.claseEstatus = rc.obtenerEstatus(detalle.estatus);
						  detalle.venta_id = venta._id;
						  detalle.entrega = venta.entrega;
						  listado.push(detalle);
						}
				  })
			  })
		  }
		  return listado;
	  },
	  listaRepartoDespues : () => {
		  var listado = [];
		  var ventas = Ventas.find({"entrega.fecha" : { $gte : rc.fechaFin }, estatus : 3}).fetch()
		  if(ventas){
			  _.each(ventas, function(venta){
				  _.each(venta.detalle, function(detalle){
					  if(detalle.estatus == 3){
						  detalle.cliente = venta.clienteSeleccionado.nombre;
						  detalle.claseEstatus = rc.obtenerEstatus(detalle.estatus);
						  detalle.venta_id = venta._id;
						  detalle.entrega = venta.entrega;
						  listado.push(detalle);
					  }
				  })
			  })
		  }
		  return listado;
	  },
	  listaEnviados : () => {
		  var listado = [];
		  var ventas = Ventas.find({estatus :  {$in : [3,4]}}).fetch()
		  if(ventas){
			  _.each(ventas, function(venta){
				  _.each(venta.detalle, function(detalle){
					  if(detalle.estatus == 4){
						  detalle.cliente = venta.clienteSeleccionado.nombre;
						  detalle.claseEstatus = rc.obtenerEstatus(detalle.estatus);
						  detalle.venta_id = venta._id;
						  detalle.entrega = venta.entrega;
						  listado.push(detalle);
					  }
				  })
			  })
		  }
		  return listado;
	  },
	  listaEntregados : () => {
		  var listado = [];
		  var ventas = Ventas.find({estatus :  {$in : [5]}}).fetch()
		  if(ventas){
			  _.each(ventas, function(venta){
				  _.each(venta.detalle, function(detalle){
					  if(detalle.estatus == 5){
						  detalle.cliente = venta.clienteSeleccionado.nombre;
						  detalle.claseEstatus = rc.obtenerEstatus(detalle.estatus);
						  detalle.venta_id = venta._id;
						  detalle.entrega = venta.entrega;
						  listado.push(detalle);
					  }
				  })
			  })
		  }
		  return listado;
	  }
  });
  
  this.obtenerEstatus = function(estatus){
	  if(estatus == 3){
		  return "terminado";
	  }if(estatus == 4){
		  return "enviado";
	  }else if(estatus == 5){
		  return "entregado";
		}
  }
  
  this.llevarArreglo = function(arreglo){
	  var venta = Ventas.findOne(arreglo.venta_id);
	  delete venta._id;
	  arreglo.estatus = 4;
	  arreglo.tomado = true;
	  arreglo.repartidor = {};
	  arreglo.repartidor.nombre = rc.repartidor.profile.nombre;
	  arreglo.repartidor.repartidor_id = rc.repartidor._id;
	  arreglo.repartidor.fecha = new Date();
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
		  if(arreglo.estatus <= 3){
			  estaTerminado = false;
		  }
	  });
	  
	  if(estaTerminado){
		  Ventas.update(
		  	{_id : arreglo.venta_id},
		  	{$set : { estatus : 4}}
		  )
	  }
	  
	  toastr.info("Ha tomando un nuevo arreglo");
  }
  
  this.cancelar = function(arreglo){
	  var venta = Ventas.findOne(arreglo.venta_id);
	  delete venta._id;
	  venta.estatus = 3;
	  arreglo.estatus = 3;
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
	  });
	  
	  toastr.warning("Ha cancelado el envío");
  }
  
  this.entregarArreglo = function(arreglo){
	  var venta = Ventas.findOne(arreglo.venta_id);
	  venta.estatus = 5;
	  delete venta._id;
	  arreglo.estatus = 5;
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
		  if(arreglo.estatus <= 4){
			  estaTerminado = false;
		  }
	  });
	  
	  if(estaTerminado == false){
		  Ventas.update(
		  	{ _id : arreglo.venta_id },
		  	{ $set : { estatus : 4 }}
		  )
	  }
	  toastr.success("Ha entregado el ramo");
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
  
  this.duracion = function(fecha){
	  var hoy = moment();
	  var inicie = moment(fecha);
		return inicie.from(hoy);
  }
  
  this.ver = function(arreglo){
	  this.postitSeleccionado = arreglo;
	  $('#myModal').modal('show')
  }
  
  $( document ).ready(function() {
	    rc.altoSeleccionado = angular.element('#pendiente').height();
	});
  
};