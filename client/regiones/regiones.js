angular.module("casserole")
.controller("RegionesCtrl", RegionesCtrl);
 function RegionesCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr, SaveService){
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;
  this.region = {};

	this.subscribe('regiones', function(){
		return [{estatus : true}]
	});

	this.helpers({
	  	regiones : () => {
		  	return Regiones.find();
			}
  });
  
  this.nuevaRegion = function()
  {
	    this.action = true;
	    this.nuevo = !this.nuevo;
	    this.region = {};		
	    var cantidad = Regiones.find().count();
		  if(cantidad > 0){
			  var ultimo = Regiones.findOne({}, {sort: {fechaCreacion:-1}});
			  if(ultimo){
				  anterior = parseInt(ultimo.clave) + 1;
				  anterior = '' + anterior;
	
				  for(var i = 0; i <= ultimo.clave.length; i++){
					  if(anterior.length <= 1){
						  anterior = "0" + anterior;
					  }
				  }
			  	rc.region.clave = anterior;
			  }
		  }else{
			  rc.region.clave = "01";
		  }
  };
  
  this.guardar = function(region,form)
	{
			if(form.$invalid){
				toastr.error('Error al guardar los datos.');
				return;
		    }
			region.estatus = true;
			region.usuarioInserto = Meteor.userId();
			region.fechaCreacion = new Date();
			SaveService.save('regiones', region, function(err, message){
				if(err){
					toastr.error(err);
					return
				} 
				region = {};
				rc.nuevo = true;
				$('.collapse').collapse('hide');
				toastr.success(message);
			});
			
	};
	
	this.editar = function(id)
	{
	    this.region = Regiones.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(region,form)
	{
		  if(form.$invalid){
	        toastr.error('Error al actualizar los datos.');
	        return;
	    }
		  var idTemp = region._id;
		  delete region._id;
		  region.usuarioActualizo = Meteor.userId(); 
		  Regiones.update({_id:idTemp},{$set:region});
		  toastr.success('Actualizado correctamente.');
		  $('.collapse').collapse('hide');
		  this.nuevo = true;
		  form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
		var region = Regiones.findOne({_id:id});
		if(region.estatus == true)
			region.estatus = false;
		else
			region.estatus = true;
		
		Regiones.update({_id: id},{$set :  {estatus : region.estatus}});
  };
		
};
