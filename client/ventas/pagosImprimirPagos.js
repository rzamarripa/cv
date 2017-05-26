angular
  .module('casserole')
  .controller('PagosImprimirPagosCtrl', PagosImprimirPagosCtrl);
 
function PagosImprimirPagosCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
	console.log($stateParams);
	window.rc = rc;
	this.cliente = {};
	this.sucursal = {};
	this.venta = {};
	this.pago = {};
	this.subTotal = 0.00;
	this.iva = 0.00;
	this.total = 0.00;
	
	Meteor.apply("imprimirTicket", [$stateParams.cliente_id, $stateParams.sucursal_id, $stateParams.folioActual], function(error, result){
		if(result){
			rc.cliente = result[0];
			rc.sucursal = result[1];
			rc.venta = result[2][0];
			rc.pago = result[3][0];
			console.log(result);
			$scope.$apply();
		}
	});
  
  
  
};
