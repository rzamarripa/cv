angular.module('casserole').directive('perfil', perfil);
	function perfil () {
  return {
    restrict: 'E',
    templateUrl: 'client/clientes/_perfil.html'
  }
}
angular.module('casserole').directive('otrospagos', otrospagos);
	function otrospagos () {
  return {
    restrict: 'E',
    templateUrl: 'client/clientes/_otrospagos.html'
  }
}
angular.module('casserole').directive('historialcliente', historialalumno);
	function historialalumno () {
  return {
    restrict: 'E',
    templateUrl: 'client/clientes/_historialalumno.html'
  }
}
angular.module('casserole').directive('modalabonar', modalabonar);
	function modalabonar () {
  return {
    restrict: 'E',
    templateUrl: 'client/clientes/_modalabonar.html'
  }
}