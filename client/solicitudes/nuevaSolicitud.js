angular.module("casserole")
.controller("NuevaSolicitudCtrl", NuevaSolicitudCtrl);  
function NuevaSolicitudCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.agregar = true;
  this.cancelar = false;
  this.nuevo = true; 
  this.solicitud = {};
  this.solicitud.detallePedido = [];
  this.material = {};	
  this.materialSeleccionado = {};	
  this.materialSeleccionado.unidad_id = this.material.unidad_id;
	this.materialIndice = 0;
	this.hoy = new Date();
  $(".js-example-basic-single").select2();
	
	window.rc = rc;
	
	if($stateParams.solicitud_id){
		console.log("Entré aquí");
		rc.subscribe('solicitudes', () => {
			return [{_id : $stateParams.solicitud_id}]
		})
		
		rc.subscribe('materiales',()=>{
			return [{estatus:true}] 
		});

		rc.subscribe('unidades',()=>{
			return [{estatus:true}] 
		});
		
		rc.subscribe('sucursales',()=>{
			return [{_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
	  });
	  
	  rc.subscribe('usuarios',()=>{
			return [{_id : this.getReactively("solicitud.usuario_id")}]; 
	  });

		rc.helpers({
		  materiales : () => {
		  	var materiales = Materiales.find().fetch();
			  	if (materiales) {
			  		_.each(materiales, function(material){
			  			material.unidad = Unidades.findOne(material.unidad_id)
			  	});
		  	}
			  return materiales;
		  },
		  unidades : () => {
			  return Unidades.find();
		  },
		  solicitud : () => {
			  var solicitud = Solicitudes.findOne();
			  if(solicitud){
				  solicitud.sucursal = Sucursales.findOne();
					solicitud.usuario = Meteor.users.findOne(solicitud.usuario_id);
			  }
			  return solicitud;
		  }
		});
	}else{
		rc.subscribe('materiales',()=>{
			return [{estatus:true}] 
		});
		
		rc.subscribe('unidades',()=>{
			return [{estatus:true}] 
		});
				  
		rc.helpers({
		  materiales : () => {
		  	var materiales = Materiales.find().fetch();
			  	if (materiales) {
			  		_.each(materiales, function(material){
			  			material.unidad = Unidades.findOne(material.unidad_id)
			  	});
		  	}
			  return materiales;
		  },
		  unidades : () => {
			  return Unidades.find();
		  },
		});
	}
	
  this.agregarMaterial = function(material)
	{ 
		this.solicitud.detallePedido.push(material);
		this.materialSeleccionado = {};
		this.material = {};
		
	};
	
	this.guardar = function(solicitud)
	{
		_.each(rc.solicitud.detallePedido, function(solicitud){
			delete solicitud.$$hashKey;
		});	
		
		this.solicitud.estatus = 1;
		this.solicitud.usuario_id = Meteor.userId();
		this.solicitud.sucursal_id = Meteor.user().profile.sucursal_id;
		console.log(this.solicitud);
		
		Meteor.apply("guardarSolicitud", [rc.solicitud], function(error, result){
			if(result){
				toastr.success('Solicitud guardada.');
				this.solicitud = {}; 
		    this.solicitud.detallepedido = [];
		    this.materialSeleccionado = {};
		    this.material = {};	
				$('.collapse').collapse('hide');
				this.nuevo = true;
				$state.go("root.verSolicitud", {solicitud_id : result});
			}
		});
	};
	
	this.modificarMaterial = function(material)
	{
		rc.solicitud.detallePedido[this.materialIndice] = material;
		this.agregar = true;
		this.cancelar = false;
		this.materialSeleccionado = {};
		this.material = {};
	};
	
	this.editar = function(id)
	{
    this.solicitud = Solicitudes.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.cambiarEstatus = function(id, estatus)
	{
		Solicitudes.update({_id:id},{ $set : { estatus : estatus }});
  };
  
	this.editarMaterial = function($index)
	{
    this.materialSeleccionado = rc.solicitud.detallePedido[$index];
    //this.materialSeleccionado._id = _id;
    this.agregar = false;
    this.cancelar = true;
    this.materialIndice = $index;
	};
	
	this.actualizar = function(solicitud)
	{
		var idTemp = solicitud._id;
		solicitud.sucursal_id = Meteor.user().profile.sucursal_id;
		
		delete solicitud._id;
		_.each(rc.solicitud.detallePedido, function(solicitud){
			delete solicitud.$$hashKey;
		});	
		Meteor.apply("actualizarSolicitud", [rc.solicitud], function(error, result){
			if(result){
				$('.collapse').collapse('hide');
				this.nuevo = true;
				$state.go("root.verSolicitud", {solicitud_id : result});
			}
		});
		
	};
	
  this.eliminarMaterial = function($index)
	{	
		rc.solicitud.detallePedido.splice($index, 1);
  };

	this.getMateriales= function(material_id)
	{
		rc.materialSeleccionado = Materiales.findOne(material_id);
		rc.materialSeleccionado.unidad = Unidades.findOne(rc.materialSeleccionado.unidad_id);
	};
	
	this.obtenerMaterial= function(material_id)
	{
		var material = Materiales.findOne(material_id);
		if(material)
		return material.nombre;
	};
	
	this.getUnidad= function(unidad_id)
	{
		var unidad = Unidades.findOne(unidad_id);
		if(unidad)
			return unidad.nombre;
	};

	this.cancelarMaterial = function()
	{
		this.agregar = true
		this.cancelar = false;
		this.materialSeleccionado = {};
	}
	
};
