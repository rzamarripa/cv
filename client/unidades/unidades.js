angular.module("casserole")
.controller("UnidadesCtrl", UnidadesCtrl);  
function UnidadesCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
let rc = $reactive(this).attach($scope);

	this.subscribe('unidades',()=>{
	return [{estatus:true}] 
    });

    this.subscribe('materiales',()=>{
	return [{estatus:true}] 
    });

 
	
  this.action = true;
  
	this.helpers({
	  unidades : () => {
		  return Unidades.find();
	  },
	  materiales : () => {
		  return Materiales.find();
	  },
	
  });
  
	this.nuevo = true;  	  
  this.nuevoUnidad = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.unidad = {};
	
  };
  
	this.guardar = function(unidad)
	{ 
		//producto.material_id = this.material_id;	
		this.unidad.estatus = true;
		console.log(this.unidad);
		Unidades.insert(this.unidad);
		toastr.success('unidad guardada.');
	     this.unidad = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};
	
	this.editar = function(id)
	{
    this.unidad = Unidades.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(unidad)
	{
		var idTemp = unidad._id;
		delete unidad._id;
		_.each(rc.unidad.detalle, function(unidad){
			delete unidad.$$hashKey;
		});			
		Unidades.update({_id:idTemp},{$set:unidad});
		$('.collapse').collapse('hide');
		this.nuevo = true;
		console.log(unidad);
	};

	this.cambiarEstatus = function(id)
	{
		var unidad = Unidades.findOne({_id:id});
		if(unidad.estatus == true)
			unidad.estatus = false;
		else
			unidad.estatus = true;
		
		Unidades.update({_id: id},{$set :  {estatus : unidad.estatus}});
    };

	this.getMateriales= function(material_id)
	{
		
		rc.materialSeleccionado = Materiales.findOne(material_id);
	};
	 this.obtenerMaterial= function(material_id)
	{
		var material = Materiales.findOne(material_id);
		if(material)
		return material.nombre;
	};
		
};
