angular.module("casserole")
.controller("NuevoPedidoCtrl", NuevoPedidoCtrl);  
function NuevoPedidoCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);

	this.buscar = {};
	this.buscar.nombreCliente = "";
	this.venta = {};
	this.venta.detalle = [];
	this.venta.total = 0;
	this.venta.anticipo = 0;
	this.venta.saldo = 0;
	this.buscando = false;
  this.hoy = new Date();
  this.action = true;
  this.agregar = true;
  this.cancelar = false;
  this.nuevo = true; 
  this.clienteSeleccionado = {};

	this.subscribe('productos',()=>{
		return [{estatus:true, sucursal_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
  });

  this.subscribe('clientesNombre',()=>{
	  if(this.getReactively("buscar.nombreCliente").length >= 3){
		  return [{nombreCompleto : this.getReactively("buscar.nombreCliente"), estatus : "1"}] 
	  }else{
		  return [{}];
	  }		
  });

  this.subscribe('unidades',()=>{
		return [{estatus:true}] 
  });
  
  $(document).ready(function(){
	  $(".select2").select2()
  })
  
  window.rc = rc;
  
	this.helpers({
	  productos : () => {
		  return Productos.find();
	  },
	  clientes : () => {
		  return Meteor.users.find({roles : ["cliente"]});
	  },
	  unidades : () => {
		  return Unidades.find();
	  }
  });
  
  	
	this.guardar = function(venta)
	{
		_.each(rc.venta.detalleProducto, function(producto, indice){
			delete producto.$$hashKey;
		});	
		
		var total = 0;
		rc.venta.sucursal_id = Meteor.user().profile.sucursal_id;
		rc.venta.estatus = 1;
		console.log("datos del pedido", rc.venta);
		Ventas.insert(rc.venta);
		toastr.success('Venta realizada.');
		this.venta = {};
		this.venta.detalle = [];
		this.venta.total = 0;
		this.venta.anticipo = 0;
		this.venta.saldo = 0;
		$('.collapse').collapse('hide');
		this.nuevo = true;
		//$state.go('root.productos');
	};
	
	this.editar = function(id)
	{
    this.producto = Productos.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
		
	this.seleccionar = function(cliente){
		console.log(cliente);
		rc.clienteSeleccionado = cliente;
		rc.venta.clienteSeleccionado = cliente.profile;
		rc.venta.cliente_id = cliente._id;
		rc.buscar.nombreCliente = cliente.profile.nombreCompleto;
		rc.buscando = false;
	}
	
	this.buscandoCliente = function(){
		rc.clienteSeleccionado = {};
		if(this.buscar.nombreCliente.length >= 3){
			rc.buscando = true;
		}else{
			
			rc.buscando = false;
		}
	}
	
	this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
			  
	  }else{
		  return foto;
	  }
  }
  
  this.agregar = function(producto){
	  var producto_id = rc.venta.detalle.length + 1;
	  rc.productoManual = {};
	  console.log("producto", producto)
	  producto.importe = producto.cantidad * producto.precio;
	  if(producto.detalleProducto){
		  rc.venta.detalle.push({
			  _id : producto_id,
			  cantidad : producto.cantidad,
			  descripcion : producto.descripcion,
			  detalleProducto : producto.detalleProducto,
			  importe : producto.importe,
			  precio : producto.precio,
			  tipoProducto : "catalago",
			  estatus : 1,
			  producto_id : producto._id
		  });
	  }else{
		  rc.venta.detalle.push({
			  _id : producto_id,
			  cantidad : producto.cantidad,
			  descripcion : producto.descripcion,
			  importe : producto.importe,
			  precio : producto.precio,
			  tipoProducto : "manual",
			  estatus : 1
		  });
	  }
	  console.log(producto);
	  
	  
	  rc.venta.total += producto.importe;
  }
  
  this.calcularSaldo = function(){
	  rc.venta.saldo = rc.venta.anticipo - rc.venta.total;
  }
};