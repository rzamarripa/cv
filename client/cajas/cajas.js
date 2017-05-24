angular
  .module('casserole')
  .controller('CajasCtrl', CajasCtrl);
 
function CajasCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	this.action = true;
	this.nuevo = true;
	this.cajaSeleccionada = {};
	this.cajaSeleccionadaParaCierre = {};
	this.confirmarSaldo = false;
	this.habilitarAbrirCaja = false;
	this.usuarios_ids = [];
	this.saldoCierre = 0.00;
	this.pagos = [];
	window.rc = rc;
	
	this.subscribe('cajas',()=>{
		return [{sucursal_id : Meteor.user() && Meteor.user().profile ? Meteor.user().profile.sucursal_id : "" }] 
  });

  this.subscribe('materiales',()=>{
		return [{estatus:true}] 
  });
  
  this.subscribe('usuarios',()=>{
		return [{_id : { $in : _.uniq(this.getReactively("usuarios_ids"))}}];
  });
    
	this.helpers({
	  cajas : () => {
		  var cajas = Cajas.find().fetch();
		  if(cajas){
			  _.each(cajas, function(caja){
				  rc.usuarios_ids.push(caja.usuario_id);
				  rc.usuarios_ids.push(caja.usuarioCierre_id);
				  caja.usuario = Meteor.users.findOne(caja.usuario_id)
			  })
		  }
		  return cajas;
	  }
  });
 
  this.nuevaCaja = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.caja = {};
	
  };
  
	this.guardar = function(caja)
	{ 
		//producto.material_id = this.material_id;	
		caja.estatus = true;
		caja.abierta = false;
		caja.sucursal_id = Meteor.user().profile.sucursal_id;
		Cajas.insert(this.caja);
		toastr.success('Caja guardada.');
	  this.caja = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};
	
	this.editar = function(id)
	{
    this.caja = Cajas.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(caja)
	{
		var idTemp = caja._id;
		delete caja._id;			
		Cajas.update({_id:idTemp},{$set:caja});
		$('.collapse').collapse('hide');
		this.nuevo = true;
		console.log(caja);
	};

	this.cambiarEstatus = function(id)
	{
		var caja = Cajas.findOne({_id:id});
		if(caja.estatus == true)
			caja.estatus = false;
		else
			caja.estatus = true;
		
		Cajas.update({_id: id},{$set :  {estatus : caja.estatus}});
  };
  
  this.abrir = function(caja){
	  var tieneAbiertas = false;
	  _.each(rc.cajas, function(caja){
		  if(caja.usuario_id == Meteor.userId()){
			  tieneAbiertas = true;
		  }
	  })
	  
	  if(tieneAbiertas == true){
		  toastr.warning("Usted ya tiene una caja abierta, no puede tener dos cajas abiertas, cierre la que tiene abierta antes de abrir otra");
		  $('#abrirCaja').modal('hide')
			return;
	  }
	  this.cajaSeleccionada = caja;
	  this.confirmarSaldo = false;
		this.habilitarAbrirCaja = false;
		if(caja.usuarioCierre_id)
			caja.usuarioCierre = Meteor.users.findOne(caja.usuarioCierre_id);
		$('#abrirCaja').modal('show')
  }
  
  this.confirmarSaldoActual = function(caja){
	  this.confirmarSaldo = false;
	  this.saldoInicial = caja.saldoInicial;
	  this.habilitarAbrirCaja = true;
  }
  
  this.noConfirmarSaldoActual = function(caja){
	  this.confirmarSaldo = true;
	  this.saldoActual = caja.saldoActual;
	  this.habilitarAbrirCaja = true;
  }
  
  this.confirmarAbrirCaja = function(caja){
	  this.confirmarSaldo = true;
	  Cajas.update(caja._id, { $set : { usuario_id : Meteor.userId(), saldoActual : this.saldoActual, abierta : true, saldoInicial : rc.saldoInicial}});
	  toastr.success("Has abierto la caja con un saldo de: " + this.saldoActual);
	  $('#abrirCaja').modal('hide')
  }
  
  this.cerrar = function(caja){
	  this.cajaSeleccionadaParaCierre = caja;
	  Meteor.apply("getVentasPorFolios", [_.pluck(caja.folios, "folio")], function(error, result){
		  if(result){
			  rc.pagos = result;
			  $scope.$apply();
		  }
	  })
  }
  
  this.confirmarCerrarCaja = function(caja){
	  Cajas.update(caja._id, { $set : { usuarioCierre_id : Meteor.userId(), abierta : false, folios : [], saldoInicial : rc.saldoCierre, usuario_id : "", saldoActual : 0.00}})
	  toastr.success("Se ha cerrado la caja correctamente");
	  $('#cerrarCaja').modal('hide')
  }
};