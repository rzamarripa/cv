angular.module("casserole")
.controller("MaterialesCtrl", MaterialesCtrl);  
function MaterialesCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
$reactive(this).attach($scope);

	this.subscribe('materiales');

    this.subscribe('unidades',()=>{
		return [{estatus:true}] 
    });

 
	
  	this.action = true;
  
	this.helpers({
	  materiales : () => {
	  	var mat = Materiales.find({}, {sort: {nombre:1}}).fetch();
	  	if(mat != undefined ){
	  		_.each(mat, function(material){
		  		console.log(material);
		  	})
	  	}
	  	
		return mat;
	  },
	   unidades : () => {
		  return Unidades.find();
	  },
	
  });
  
	this.nuevo = true;  	  
  this.nuevoMaterial = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.material = {};		
  };
  
  this.guardar = function(material)
	{
		this.material.estatus = true;
		console.log(this.material);
		Materiales.insert(this.material);
		toastr.success('Material guardado.');
		this.material = {}; 
		$('.collapse').collapse('hide');
		this.nuevo = true;
		
	};
	
	this.editar = function(id)
	{
    this.material = Materiales.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(material)
	{
		var idTemp = material._id;
		delete material._id;		
		Materiales.update({_id:idTemp},{$set:material});
		$('.collapse').collapse('hide');
		this.nuevo = true;
		console.log(material);
	};

	this.cambiarEstatus = function(id)
	{
		var material = Materiales.findOne({_id:id});
		if(material.estatus == true)
			material.estatus = false;
		else
			material.estatus = true;
		
		Materiales.update({_id: id},{$set :  {estatus : material.estatus}});
    };

    this.obtenerUnidad= function(unidad_id)
	{
		var unidad = Unidades.findOne(unidad_id);
		if(unidad)
		return unidad.nombre;
	};
		
};
