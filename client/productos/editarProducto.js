angular.module("casserole")
.controller("EditarProductosCtrl", EditarProductosCtrl);  
function EditarProductosCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
let rc = $reactive(this).attach($scope);

	this.materialIndice = 0;
	this.imagenes = [];

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
	this.producto = {};
	this.producto.detalleProducto = [];
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
    
  this.agregarMaterial = function(material){ 
	  console.log(material);
		this.producto.detalleProducto.push(material);
		console.log(rc.producto)
		this.materialSeleccionado = {};
		this.material = {};
		
	};
	this.guardar = function(producto){ 
		//producto.material_id = this.material_id;
		_.each(rc.producto.detalleProducto, function(producto){
			delete producto.$$hashKey;
		});	
		 var total = 0;
		_.each(rc.producto.detalleProducto,function(producto){total += producto.precio * producto.cantidad});

		this.producto.precio = parseFloat(total.toFixed(2));
		this.producto.estatus = true;
		console.log(this.producto);
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
	this.modificarMaterial = function(material){
		rc.producto.detalleProducto[this.materialIndice] = material;
		this.agregar = true;
		this.cancelar = false;
		this.materialSeleccionado = {};
		this.material = {};
	}
	this.editar = function(id){
    this.producto = Productos.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	this.editarMaterial = function($index){
    this.materialSeleccionado = rc.producto.detalleProducto[$index];
    //this.materialSeleccionado._id = _id;

    this.agregar = false;
    this.cancelar = true;
    this.materialIndice = $index;
    console.log(this.materialSeleccionado);

	};
	this.actualizar = function(producto){
		var idTemp = producto._id;
		delete producto._id;
		
		console.log("actualizando");
		FS.Utility.eachFile(event, function(file){
			var newFile = new FS.File(file);
			console.log(newFile);
			Images.insert(newFile, function(error, result){
				toastr.success("Imagen guardada");
			})
		})
		_.each(rc.producto.detalleProducto, function(producto){
			delete producto.$$hashKey;
		});	
		Productos.update({_id:idTemp},{$set:producto});
		$('.collapse').collapse('hide');
		this.nuevo = true;
		console.log(producto);
		$state.go('root.productos');
	};

	this.cambiarEstatus = function(id){
		var producto = Productos.findOne({_id:id});
		if(producto.estatus == true)
			producto.estatus = false;
		else
			producto.estatus = true;
		
		Productos.update({_id: id},{$set :  {estatus : producto.estatus}});
  };
  
  this.cambiarEstatusMaterial = function(id){
		var producto = rc.producto.detalleProducto
		if(producto.estatus == true)
			producto.estatus = false;
		else
			producto.estatus = true;
		
		Productos.update({_id: id},{$set :  {estatus : producto.estatus}});
  };
  
  this.eliminarMaterial = function($index){
		rc.producto.detalleProducto.splice($index, 1);
  };

	this.getMateriales= function(material_id)
	{
		console.log(material_id);
		rc.materialSeleccionado = Materiales.findOne(material_id);
		rc.materialSeleccionado.unidad = Unidades.findOne(rc.materialSeleccionado.unidad_id);
	};
	
	this.obtenerMaterial= function(material_id){
		var material = Materiales.findOne(material_id);
		if(material)
		return material.nombre;
	};
	
	this.getUnidad= function(unidad_id){
		var unidad = Unidades.findOne(unidad_id);
		if(unidad)
		return unidad.nombre;
	};
	
	this.cancelarMaterial = function(){
		this.agregar = true
		this.cancelar = false;
		this.materialSeleccionado = {};
	}


	this.SumaPrecioProductos = function(){
		total = 0;
		if(rc.producto){
			_.each(rc.producto.detalleProducto,function(producto){total += producto.precio * producto.cantidad});
		}
			
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
