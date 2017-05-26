angular.module("casserole")
.controller("VentasCtrl", VentasCtrl);  
function VentasCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
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
	
	this.subscribe('ventas',()=>{
		return [{sucursal_id : Meteor.user() ? Meteor.user().profile.sucursal_id : "", "fechaCreacion" : { $gte : rc.getReactively("fechaInicial"), $lt: rc.getReactively("fechaFinal")}}]
  });
	
  this.subscribe('unidades',()=>{
		return [{estatus:true}] 
  });
  
  this.subscribe('sucursales',()=>{
		return [{_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
  });
  
  this.subscribe('usuarios',()=>{
		return [{_id : { $in : this.getCollectionReactively("clientes_ids")}}]; 
  });
  
	this.helpers({
	  ventas : () => {
		  var ventasFormadas = Ventas.find().fetch();
		  if(ventasFormadas){
			  var clientes_id = [];
			  rc.saldoTotal = 0.00;
			  rc.pagadoTotal = 0.00;
			  _.each(ventasFormadas, function(venta){
				  clientes_id.push(venta.cliente_id);
				  rc.saldoTotal += venta.saldo;
				  rc.pagadoTotal += venta.pagado + parseFloat(venta.anticipo);
				  venta.clienteSeleccionado = Meteor.users.findOne({_id : venta.cliente_id}, {}, { fields : { "profile.nombreCompleto" : 1, _id : 0}});
				  venta.estatusNombre = rc.getEstatusNombre(venta.estatus);
				  venta.estatusNombrePago = rc.getEstatusNombrePago(venta.estatusPago);
			  });
			  rc.clientes_ids = _.uniq(clientes_id);
		  }
		  return ventasFormadas;
	  },
	  clientes : () => {
		  return Meteor.users.find({roles : ["cliente"]});
		}
  });
  
  this.getEstatusNombre = function(estatus){
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
  
  this.mostrarModalPago = function(venta_id, arreglo){
	  Meteor.apply("obtenerVenta", [venta_id], function(error, result){
		  if(result){
			  rc.ventaSeleccionada = result;
			  rc.importeAPagar = result.saldo;
			  //console.log(result);
			  $('#pagar').modal('show');
			  $scope.$apply();
		  }else if(error){
			  console.log(error);
		  }
	  });
  }
  
  this.pagar = function(venta, importe, form){
	  if(form.$invalid){
	    toastr.error('Defina el importe a pagar.');
	    return;
		}

	  var saldo = venta.saldo - importe;
	  var pagado = venta.pagado + importe;
	  
	  if(saldo <= 0){
		  venta.estatusPago = 2;
	  }else if(saldo > 0){
		  venta.estatusPago = 1;
	  }
	  
	  //Aumentar folio sucursal
		var sucursal = Sucursales.findOne();
		var folioActual = sucursal.folioActual + 1;
	  
	  var folios = venta.folios;
	  folios.push(folioActual);
	  
	  Pagos.insert({
			folio : folioActual,
			venta_id : venta._id,
			pago : importe,
			saldo : venta.saldo - importe,
			total : venta.total,
			fechaPago : new Date(),
			sucursal_id : venta.sucursal_id,
			estatus : 1,
			cliente_id : venta.cliente_id,
			formaPago : rc.ventaSeleccionada.formaPago,
			usuario_id : Meteor.userId()			
		});
		
		Sucursales.update({_id : sucursal._id},{$set: {folioActual : folioActual}});
		
		Ventas.update({_id : rc.ventaSeleccionada._id}, { $set : { saldo : saldo, estatusPago : venta.estatusPago, pagado : pagado, folios : folios }});
		
		toastr.success("El pago se ha registrado");
		$('#pagar').modal('hide');
		
		rc.ventaSeleccionada = {}; 
		
		var url = $state.href("anon.pagosImprimirPagos",{sucursal_id : venta.sucursal_id, folioActual : folioActual, cliente_id : venta.cliente_id},{newTab : true});
		window.open(url,'_blank');
  }
  
  this.seleccionarFormaPago = function(formaPago, archivo){
	  if(formaPago == 'Intercambio'){
		  var contrasena = prompt("Escriba la contraseña del Gerente", "");
		  Meteor.apply("validarContrasena", [Meteor.user().username, contrasena], function(error, result){
			  if(result){
				  
			  }else{
				  alert("No puede elegir intercambio, contraseña incorrecta.");
				  rc.ventaSeleccionada.formaPago = undefined;
				  $scope.$apply();
			  }
		  });
	  }else{
		  rc.ventaSeleccionada.formaPago = formaPago;
	  }
	  rc.archivo = archivo;
  }
  
};