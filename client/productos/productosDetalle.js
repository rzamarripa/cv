angular.module("casserole")
.controller("ProductosDetalleCtrl", ProductosDetalleCtrl);  
function ProductosDetalleCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
let rc = $reactive(this).attach($scope);

	this.materialIndice = 0;

	this.subscribe('productos',()=>{
		return [{estatus:true}] 
  });

  this.subscribe('materiales',()=>{
		return [{estatus:true}] 
  });

  this.subscribe('unidades',()=>{
		return [{estatus:true}] 
  });
  
	this.materialSeleccionado = {};
	this.material = {};
	
  this.action = true;
  this.agregar = true;
  this.cancelar = false;
  this.nuevo = true; 
  
  window.rc = rc;
  
	this.helpers({
	  producto : () => {
		  return Productos.findOne({_id : $stateParams.producto_id});
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
  
  this.producto = {};
  this.producto.detalleProducto = [];
  this.producto.imagenes = [];
  this.material = {};	
  this.materialSeleccionado = {};	
  this.materialSeleccionado.unidad_id = this.material.unidad_id;

  $(".js-example-basic-single").select2();
  
  this.agregarMaterial = function(material)
	{ 
		material._id = rc.materialSeleccionado._id;
		this.producto.detalleProducto.push(material);
		this.materialSeleccionado = {};
		this.material = {};
	};
	
	this.guardar = function(producto)
	{ 
		if(form.$invalid || this.producto.detalleProducto.length <= 0){
      toastr.error('Error al guardar los datos.');
      return;
	  }
	  
	  var totalPrecio = 0;
		var totalCosto = 0;
	  
		_.each(rc.producto.detalleProducto, function(producto){
			delete producto.$$hashKey;
		});	
		 
		_.each(rc.producto.detalleProducto,function(producto){
			totalPrecio += producto.precio * producto.cantidad;
			totalCosto += producto.costo * producto.cantidad;
		});

		this.producto.precio = parseFloat(totalPrecio.toFixed(2));
		this.producto.costo = parseFloat(totalCosto.toFixed(2));
		this.producto.estatus = true;
		this.producto.sucursal_id = Meteor.user().profile.sucursal_id;
		Productos.insert(this.producto);
		toastr.success('producto guardado.');
		this.producto = {}; 
    this.producto.detalleProducto = [];
    this.producto = {};
    this.materialSeleccionado = {};
    this.material = {};	
		$('.collapse').collapse('hide');
		this.nuevo = true;
		$state.go('root.productos');
	};
	
	this.modificarMaterial = function(material)
	{
		rc.producto.detalleProducto[this.materialIndice] = material;
		this.agregar = true;
		this.cancelar = false;
		this.materialSeleccionado = {};
		this.material = {};
	};
	
	this.editar = function(id)
	{
    this.producto = Productos.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.cambiarEstatus = function(id)
	{
		var producto = Productos.findOne({_id:id});
		if(producto.estatus == true)
			producto.estatus = false;
		else
			producto.estatus = true;
		
		Productos.update({_id: id},{$set :  {estatus : producto.estatus}});
  };
  
	this.editarMaterial = function($index)
	{
    this.materialSeleccionado = rc.producto.detalleProducto[$index];
    //this.materialSeleccionado._id = _id;
    this.agregar = false;
    this.cancelar = true;
    this.materialIndice = $index;
    console.log(this.materialSeleccionado);
	};
	
	this.actualizar = function(producto)
	{
		var idTemp = producto._id;
		producto.sucursal_id = Meteor.user().profile.sucursal_id;
		
		delete producto._id;
		_.each(rc.producto.detalleProducto, function(producto){
			delete producto.$$hashKey;
		});	
		Productos.update({_id:idTemp},{$set:producto});
		$('.collapse').collapse('hide');
		this.nuevo = true;
		console.log(producto, 2);
		$state.go('root.productos');
	};
	
  this.eliminarMaterial = function($index)
	{	
		rc.producto.detalleProducto.splice($index, 1);
  };

	this.getMateriales= function(material_id)
	{
		console.log(material_id);
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

	this.sumaPrecioProductos = function(){
		total = 0;
			_.each(rc.producto.detalleProducto,function(producto){total += producto.precio * producto.cantidad});
		return total;
	}
	this.sumaPrecioProductosCostos = function(){
		total = 0;
			_.each(rc.producto.detalleProducto,function(producto){total += producto.costo * producto.cantidad});
		return total;
	}
		
	this.tomarFoto = function(){
		$meteor.getPicture({width:200, height: 200, quality: 50}).then(function(data){
			rc.producto.fotografia = data;
		});
	};
	
	this.agregarImagen = function(imagen){
		if(this.producto.imagenes == undefined){
			rc.producto.imagenes = [];
		}
		this.producto.imagenes.push({nombre : ""})
	}
		
};
