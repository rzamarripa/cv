angular.module("casserole")
.controller("CatalogoCtrl", CatalogoCtrl).directive('slide', [function() { 
    return { }
}]);  
function CatalogoCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);

	this.subscribe('clientes',()=>{
		return [{estatus:true}] 
  });

  this.subscribe('productos',()=>{
		return [{estatus:true}] 
  });

  this.subscribe('unidades',()=>{
		return [{estatus:true}] 
  });
	
	this.subscribe('materiales',()=>{
		return [{estatus:true}] 
  });

	this.materialSeleccionado = {};
	this.material = {};
	this.producto = {};
	this.producto.detalleProducto = [];	
  this.action = true;
  this.agregar = true;
  this.cancelar = false;
  this.nuevo = true; 
  
  window.rc = rc;
  
	this.helpers({
	  productos : () => {
		  return Productos.find();
	  },
	  materiales : () => {
	  	var materiales = Materiales.find().fetch();
		  	if (materiales) {
		  		_.each(materiales, function(material){
		  			material.unidad = Unidades.findOne(material.unidad_id)

		  	});
	  	}
	  	console.log(materiales);
		  return materiales;
	  },
	  unidades : () => {
		  return Unidades.find();
	  },
  });		
};
