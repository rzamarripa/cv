angular.module("casserole")
.controller("PedidosCtrl", PedidosCtrl);  
function PedidosCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);

	this.subscribe('ventas',()=>{
		return [{sucursal_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
  });

  this.subscribe('unidades',()=>{
		return [{estatus:true}] 
  });
  
  this.subscribe('sucursales',()=>{
		return [{_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
  });
  
  window.rc = rc;
  this.ventaSeleccionada = {}
  
	this.helpers({
	  ventas : () => {
		  var ventasFormadas = Ventas.find().fetch();
		  if(ventasFormadas){
			  _.each(ventasFormadas, function(venta){
				  venta.estatusNombre = rc.getEstatusNombre(venta.estatus);
				  venta.estatusNombrePago = rc.getEstatusNombrePago(venta.estatusPago);
			  })
		  }
		  return ventasFormadas;
	  }
  });
  
  this.getEstatusNombre = function(estatus){
	  console.log(estatus);
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
	  console.log(estatus);
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
			  console.log(result);
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
		
	  console.log(venta, importe);
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
			formaPago : venta.formaPago,
			usuario_id : Meteor.userId()			
		});
		
		Ventas.update({_id : rc.ventaSeleccionada._id}, { $set : { saldo : saldo, estatusPago : venta.estatusPago, pagado : pagado }});
		
		toastr.success("El pago se ha registrado");
		$('#pagar').modal('hide')
  }
  
};