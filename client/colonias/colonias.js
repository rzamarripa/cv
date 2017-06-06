angular.module("casserole")
.controller("ColoniasCtrl", ColoniasCtrl);  
function ColoniasCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
let rc = $reactive(this).attach($scope);

	this.subscribe('colonias',()=>{
		return [{}] 
  }); 
	
  this.action = true;
	this.nuevo = true;
	
	this.helpers({
	  colonias : () => {
		  return Colonias.find();
	  }
  });

  this.nuevaColonia = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.unidad = {};
  };
  
	this.guardar = function(colonia)
	{
		this.colonia.estatus = true;
		console.log(this.colonia);
		this.colonia.sucursal_id = Meteor.user().profile.sucursal_id;
		Colonias.insert(this.colonia);
		toastr.success('Colonia guardada.');
		this.colonia = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};
	
	this.editar = function(id)
	{
    this.colonia = Colonias.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(colonia)
	{
		var idTemp = colonia._id;
		delete colonia._id;
		Colonias.update({_id:idTemp},{$set:colonia});
		$('.collapse').collapse('hide');
		this.nuevo = true;
		console.log(colonia);
	};

	this.cambiarEstatus = function(id)
	{
		var colonia = Colonias.findOne({_id:id});
		if(colonia.estatus == true)
			colonia.estatus = false;
		else
			colonia.estatus = true;
		
		Colonias.update({_id: id},{$set :  {estatus : colonia.estatus}});
  };		
};
