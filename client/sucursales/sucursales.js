angular
  .module('casserole')
  .controller('SucursalesCtrl', SucursalesCtrl);
 
function SucursalesCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	let rc = $reactive(this).attach($scope);
	this.parametros = $stateParams;
	this.action = true;  
  this.nuevo = true;
  window.rc = rc;
	
  this.subscribe('regiones', function(){
		return [{
			_id : this.getReactively("parametros.region_id")
		}]
	});
	
	this.subscribe('sucursales', function(){
		return [{region_id : this.getReactively("parametros.region_id")
		}]
	});
	
  this.helpers({
	  sucursales : () => {
		  return Sucursales.find();
	  },
	  region : () => {		   
		  return Regiones.findOne();
	  }
  });
 
  this.getRegion = function(id)
  { 
	  if(id){
	  	var region = Regiones.findOne(id);
	  	return Regiones.nombre; 
  	}
  }; 
	
  this.nuevaSucursal = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.sucursal = {}; 
  };
  
  this.guardar = function(sucursal,form)
	{
		if(form.$invalid){
	    toastr.error('Error al guardar los datos.');
	    return;
		}
		sucursal.estatus = true;
		sucursal.region_id = $stateParams.region_id;
		sucursal.usuarioInserto = Meteor.userId();
		sucursal.folioActual = 0;
		
		sucursal_id = Sucursales.insert(this.sucursal);
		var nombre = sucursal.nombre != undefined ? sucursal.nombre + " " : "";
		var apPaterno = sucursal.apPaterno != undefined ? sucursal.apPaterno + " " : "";
		var apMaterno = sucursal.apMaterno != undefined ? sucursal.apMaterno : ""
		sucursal.nombreCompleto = nombre + apPaterno + apMaterno;
		var usuario = {
			username : sucursal.username,
			password : sucursal.password,
			profile : {
				nombre : sucursal.nombre,
				apPaterno : sucursal.apPaterno,
				apMaterno : sucursal.apMaterno,
				nombreCompleto : nombre + apPaterno + apMaterno,
				region_id : $stateParams.region_id,
				region_clave : rc.region.clave,
				sucursal_id : sucursal_id,
				estatus : true,
				sexo : sucursal.sexo
			}
		}
		
		delete sucursal.password;

		Meteor.call('createGerenteVenta', usuario, 'gerente');
		toastr.success('Guardado correctamente.');
		this.sucursal = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
	};
	
	this.editar = function(id)
	{
		this.sucursal = Sucursales.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;		
	};
	
	this.actualizar = function(sucursal,form)
	{
		if(form.$invalid){
      toastr.error('Error al actualizar los datos.');
      return;
	  }
		var idTemp = sucursal._id;
		delete sucursal._id;		
		Sucursales.update({_id:idTemp},{$set:sucursal});
		var nombre = sucursal.nombre != undefined ? sucursal.nombre + " " : "";
		var apPaterno = sucursal.apPaterno != undefined ? sucursal.apPaterno + " " : "";
		var apMaterno = sucursal.apMaterno != undefined ? sucursal.apMaterno : "";
		sucursal.nombreCompleto = nombre + apPaterno + apMaterno;
		var usuario = {
			username : sucursal.username,
			password : sucursal.password,
			profile : {
				nombre : sucursal.nombre,
				apPaterno : sucursal.apPaterno,
				apMaterno : sucursal.apMaterno,
				nombreCompleto : nombre + apPaterno + apMaterno,
				region_id : $stateParams.region_id,
				region_clave : rc.region.clave,
				sucursal_id : idTemp,
				estatus : true,
				sexo : sucursal.sexo
			}
		}
		Meteor.call('updateGerente', usuario, 'gerente');
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;	
	};

	this.cambiarEstatus = function(id)
	{
			var sucursal = Sucursales.findOne({_id:id});
			if(sucursal.estatus == true)
				sucursal.estatus = false;
			else
				sucursal.estatus = true;
			
			Sucursales.update({_id:id}, {$set : {estatus : sucursal.estatus}});	
	};
	
	this.seleccionarLogo = function(logo){
		rc.sucursal.logo = logo;
	}
		
}