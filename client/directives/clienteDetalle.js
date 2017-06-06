angular.module('casserole').directive('perfil', perfil);
	function perfil () {
  return {
    restrict: 'E',
    templateUrl: 'client/clientes/_perfil.html'
  }
}
angular.module('casserole').directive('comprascliente', comprascliente);
	function comprascliente () {
  return {
    restrict: 'E',
    templateUrl: 'client/clientes/_comprascliente.html'
  }
}
angular.module('casserole').directive('historialcliente', historialalumno);
	function historialalumno () {
  return {
    restrict: 'E',
    templateUrl: 'client/clientes/_historialcliente.html'
  }
}