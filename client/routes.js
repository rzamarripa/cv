angular.module("casserole").run(function ($rootScope, $state, toastr) {
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    switch(error) {
      case "AUTH_REQUIRED":
        $state.go('anon.login');
        break;
      case "FORBIDDEN":
        //$state.go('root.home');
        break;
      case "UNAUTHORIZED":
      	toastr.error("Acceso Denegado");
				toastr.error("No tiene permiso para ver esta opción");
        break;
      default:
        $state.go('internal-client-error');
    }
  });
  $rootScope.$on('$stateChangeStart', function(next, current) { 
    NProgress.set(0.2);
  });
  $rootScope.$on('$stateChangeSuccess', function(next, current) { 
    NProgress.set(1.0);
  });
});

angular.module('casserole').config(['$injector', function ($injector) {
  var $stateProvider = $injector.get('$stateProvider');
  var $urlRouterProvider = $injector.get('$urlRouterProvider');
  var $locationProvider = $injector.get('$locationProvider');

  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
  /***************************
   * Anonymous Routes
   ***************************/
  $stateProvider
    .state('anon', {
      url: '',
      abstract: true,
      template: '<ui-view/>'
    })
    
    .state('anon.login', {
      url: '/login',
      templateUrl: 'client/login/login.ng.html',
      controller: 'LoginCtrl',
      controllerAs: 'lc'
    })
    .state('anon.logout', {
      url: '/logout',
      resolve: {
        'logout': ['$meteor', '$state', 'toastr', function ($meteor, $state, toastr) {
          return $meteor.logout().then(
            function () {
	            toastr.success("Vuelva pronto.");
              $state.go('anon.login');
            },
            function (error) {
              toastr.error(error.reason);
            }
          );
        }]
      }
    })
    .state('anon.pagosImprimir', {
      url: '/pagosImprimir/:sucursal_id/:folioActual/:cliente_id',
      templateUrl: 'client/pedidos/pagosImprimir.ng.html',
      controller: 'PagosImprimirCtrl as pi',
     // params: { 'semanas': ':semanas' , 'id' : ':id'},
    })
    .state('anon.pagosImprimirPagos', { 
      url: '/pagosImprimirPagos/:sucursal_id/:folioActual/:cliente_id',
      templateUrl: 'client/pedidos/pagosImprimirPagos.html',
      controller: 'PagosImprimirPagosCtrl as pi',
     // params: { 'semanas': ':semanas' , 'id' : ':id'},
    });
  /***************************
   * Login Users Routes
   ***************************/
  $stateProvider
    .state('root', {
      url: '',
      abstract: true,
      templateUrl: 'client/layouts/root.ng.html',
      controller: 'RootCtrl as ro',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.home', {
      url: '/',
      templateUrl: 'client/home/home.ng.html',      
      controller: 'HomeCtrl as ho',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin" || user.roles[0] == "gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.materiales', {
      url: '/materiales',
      templateUrl: 'client/materiales/materiales.ng.html',
      controller: 'MaterialesCtrl as mat',
    })
     .state('root.editarMateriales', {
      url: '/editarMateriales/:material_id',
      templateUrl: 'client/materiales/materialesDetalle.ng.html',
      controller: 'MaterialesDetalleCtrl as mat',
    })
     .state('root.materialesDetalle', {
      url: '/materialesDetalle/',
      templateUrl: 'client/materiales/materialesDetalle.ng.html',
      controller: 'MaterialesDetalleCtrl as mat',
    })
    
    //<--///////////////// UNIDADES ////////////////////-->//
    .state('root.unidades', {
      url: '/unidades/',
      templateUrl: 'client/unidades/unidades.ng.html',
      controller: 'UnidadesCtrl as uni',
    })
    
    //<--///////////////// PRODUCTOS ////////////////////-->//
    .state('root.productos', {
      url: '/productos',
      templateUrl: 'client/productos/productos.ng.html',
      controller: 'ProductosCtrl as pro',
    })
      .state('root.editarProductos', {
      url: '/editarProductos/:producto_id',
      templateUrl: 'client/productos/productosDetalle.ng.html',
      controller: 'EditarProductosCtrl as pro',
    })
     .state('root.productosDetalle', {
      url: '/productosDetalle/',
      templateUrl: 'client/productos/productosDetalle.ng.html',
      controller: 'ProductosDetalleCtrl as pro',
    })
    
    
    ///////////// HASTA AQUÍ /////////////
    
    .state('root.colonias', {
      url: '/colonias/',
      templateUrl: 'client/colonias/colonias.html',
      controller: 'ColoniasCtrl as c',
    })
    
    .state('root.dashboard', {
      url: '/dashboard',
      templateUrl: 'client/dashboard/dashboard.html',      
      controller: 'DashboardCtrl as da',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.cobranza', {
      url: '/cobranza',
      templateUrl: 'client/planPagos/cobranza/cobranza.html',      
      controller: 'CobranzaCtrl as oc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin" || user.roles[0] == "gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.clientesPorEstatus', {
      url: '/clientesPorEstatus',
      templateUrl: 'client/reportes/clientesPorEstatus.html',      
      controller: 'ClientesPorEstatusCtrl as ape',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin" || user.roles[0] == "gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.cantClientesPorEstatus', {
      url: '/cantClientesPorEstatus',
      templateUrl: 'client/reportes/cantClientesPorEstatus.html',      
      controller: 'ClientesPorEstatusCtrl as ape',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin" || user.roles[0] == "gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.clientes', {
      url: '/clientes',
      templateUrl: 'client/clientes/clientes.html',
      controller: 'ClientesCtrl as cl',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "gerente" || user.roles[0] == "director" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.clienteNuevo', {
      url: '/clienteNuevo',
      templateUrl: 'client/clientes/form.ng.html',
      controller: 'ClientesCtrl as cl',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "gerente" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
    	}
    })
    .state('root.editarCliente', {
      url: '/editarCliente/:cliente_id',
      templateUrl: 'client/clientes/form.ng.html',
      controller: 'ClientesDetalleCtrl as cl',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "gerente" || user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
    	}
    })
    .state('root.clienteDetalle', {
      url: '/clientes/:cliente_id',
      templateUrl: 'client/clientes/detalle.ng.html',
      controller: 'ClientesDetalleCtrl as cl',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "gerente" || user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })  
    .state('root.mensajes', {
      url: '/mensajes',
      templateUrl: 'client/mensajes/mensajes.html',
      controller: 'MensajesCtrl as mm',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(Meteor.user()){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.ocupaciones', {
      url: '/ocupaciones',
      templateUrl: 'client/ocupaciones/ocupaciones.ng.html',
      controller: 'OcupacionesCtrl as oc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"  || user.roles[0] == "gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.sucursales', {
      url: '/sucursales/:region_id',
      templateUrl: 'client/sucursales/sucursales.html',
      controller: 'SucursalesCtrl as sc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.regiones', {
      url: '/regiones',
      templateUrl: 'client/regiones/regiones.html',
      controller: 'RegionesCtrl as reg',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })    
    .state('root.regionDetalle', {
      url: '/regionDetalle/:id',
      templateUrl: 'client/regiones/regionDetalle.html',
      controller: 'RegionDetalleCtrl as regd',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.bitacora', {
      url: '/bitacora',
      templateUrl: 'client/bitacora/bitacora.ng.html',
      controller: 'BitacoraCtrl as bita',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.mediosPublicidad', {
      url: '/mediosPublicidad',
      templateUrl: 'client/mediosPublicidad/mediosPublicidad.ng.html',
      controller: 'MediosPublicidadCtrl as mp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.prospectosPorMedioPublicidad', {
      url: '/prospectosPorMedioPublicidad',
      templateUrl: 'client/reportes/prospectosPorMedioPublicidad/prospectosPorMedioPublicidad.html',
      controller: 'ProspectosPorMedioPublicidadCtrl as p',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.historialComentarios', {
      url: '/historialComentarios/:cliente_id',
      templateUrl: 'client/cliente/historialComentarios/historialComentarios.html',
      controller: 'HistorialComentariosCtrl as hc',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "gerente"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('root.nuevoPedido', {
      url: '/nuevoPedido',
      templateUrl: 'client/pedidos/nuevoPedido.html',
      controller: 'NuevoPedidoCtrl as np',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "gerente" || user.roles[0] == "recepcionista"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('root.pedidos', {
      url: '/pedidos',
      templateUrl: 'client/pedidos/pedidos.html',
      controller: 'PedidosCtrl as p',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "gerente" || user.roles[0] == "produccion"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('root.catalogo', {
      url: '/catalogo',
      templateUrl: 'client/catalogo/catalogo.html',
      controller: 'CatalogoCtrl as np',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "gerente" || user.roles[0] == "recepcionista"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('root.usuariosProduccion', {
      url: '/usuariosProduccion',
      templateUrl: 'client/usuariosProduccion/usuariosProduccion.html',
      controller: 'UsuariosProduccionCtrl as up',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "gerente"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('root.usuariosReparto', {
      url: '/usuariosReparto',
      templateUrl: 'client/usuariosReparto/usuariosReparto.html',
      controller: 'UsuariosRepartoCtrl as ur',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "gerente"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('anon.produccion', {
      url: '/produccion',
      templateUrl: 'client/produccion/produccion.html',
      controller: 'ProduccionCtrl as p',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
	          console.log(Meteor.user())
            if(user.roles[0] == "produccion"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('anon.repartidor', {
      url: '/repartidor',
      templateUrl: 'client/repartidor/repartidor.html',
      controller: 'RepartidorCtrl as r',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
	          console.log(Meteor.user())
            if(user.roles[0] == "repartidor"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    ;
}]);