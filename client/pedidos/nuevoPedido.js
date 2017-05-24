angular.module("casserole")
.controller("NuevoPedidoCtrl", NuevoPedidoCtrl);  
function NuevoPedidoCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);

	this.buscar = {};
	this.buscar.nombreCliente = "";
	this.venta = {};
	this.venta.detalle = [];
	this.venta.total = 0;
	this.venta.saldo = 0;
	this.buscando = false;
  this.hoy = new Date();
  this.action = true;
  this.agregar = true;
  this.cancelar = false;
  this.nuevo = true; 
  this.clienteSeleccionado = {};
  this.anticipoCero = false;
  this.venta.anonimo = false;

	this.subscribe('productos',()=>{
		return [{estatus:true, sucursal_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
  });
  
  this.subscribe('colonias',()=>{
		return [{estatus:true, sucursal_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
  });
  
  this.subscribe('sucursales',()=>{
		return [{_id : Meteor.user() ? Meteor.user().profile.sucursal_id : ""}] 
  });

  this.subscribe('clientesNombre',()=>{
	  if(this.getReactively("buscar.nombreCliente").length >= 3){
		  return [{nombreCompleto : this.getReactively("buscar.nombreCliente")}] 
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
	  },
	  colonias : () => {
		  return Colonias.find({},{sort : {nombre : 1}});
	  },
	  caja : () => {
		  return Cajas.findOne({usuario_id : Meteor.userId()});
	  }
  });
  
  	
	this.guardar = function(venta, form)
	{
		_.each(rc.venta.detalleProducto, function(producto, indice){
			delete producto.$$hashKey;
		});
		
		if(form.$invalid || rc.venta.anticipo == undefined){
      toastr.error('Error al guardar los datos.');
      return;
	  }
	  
	  if(rc.caja == undefined || rc.caja.usuario_id == "" || rc.caja.usuario_id != Meteor.userId()){
		  toastr.warning("No hay caja abierta, por favor primero abra una caja antes de realizar una venta");
		  $state.go("root.cajas");
	  }
		
		if(rc.venta.anticipo <= 0 && rc.anticipoCero == false){
			rc.anticipoCero = true;
			return
		}
		
		if(rc.venta.formaPago == undefined){
			toastr.warning("Seleccione la forma de pago");
			return;
		}
		
		//Aquí va el meteor.method
		Meteor.apply("realizarVenta", [rc.venta, rc.clienteSeleccionado, rc.caja], function(error, result){
			if(result){
				console.log(result);
				var url = $state.href("anon.pagosImprimir",{sucursal_id : result.sucursal_id, folioActual : result.folios[0], cliente_id : venta.cliente_id},{newTab : true});
				window.open(url,'_blank');
				
				rc.clienteSeleccionado = {};
				rc.buscar.nombreCliente = "";
				rc.venta = {};
				rc.venta.detalle = [];
				rc.venta.total = 0;
				rc.venta.anticipo = 0;
				rc.venta.saldo = 0;
				rc.nuevo = true;
			}else{
				toastr.error('Hubo un error');
				console.log(error);
			}
		});
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
		//rc.venta.clienteSeleccionado = cliente.profile;
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
  
  this.calcularSaldo = function(anticipo){
	  rc.venta.saldo = (parseFloat(rc.venta.anticipo) - rc.venta.total) * -1;
  }
  
  this.quitar = function(indice){	  
	  var arreglo = rc.venta.detalle[indice];
		rc.venta.total -= arreglo.importe; 
		
		rc.venta.detalle.splice(indice, 1);
  }
  
  this.seleccionarFormaPago = function(formaPago, archivo){
	  if(formaPago == 'Intercambio'){
		  var contrasena = prompt("Escriba la contraseña del Gerente", "");
		  Meteor.apply("validarContrasena", [Meteor.user().profile.sucursal_id, contrasena], function(error, result){
			  if(result){
				  
			  }else{
				  alert("No puede elegir intercambio, contraseña incorrecta.");
				  rc.venta.formaPago = undefined;
				  $scope.$apply();
			  }
		  });
	  }else{
		  rc.venta.formaPago = formaPago;
	  }
	  rc.archivo = archivo;
  }
  
  this.almacenaImagen = function(imagen){	
		rc.venta.comprobante = imagen;
	}
	
	this.almacenaImagenArreglo = function(imagen){	
		rc.venta.imagenArreglo = imagen;
	}
  
  $(document).ready( function() {
		var comprobante = document.getElementById('comprobante');			
		var imagenArreglo = document.getElementById('imagenArreglo');
		
		//JavaScript para agregar la imagen del comprobante
		comprobante.addEventListener('change', function(e) {
			var file = comprobante.files[0];
			var imageType;
			if (file.type == "application/pdf")
					imageType = /application.*/;
			else
					imageType = /image.*/;
			//console.log(imageType);
			if (file.type.match(imageType)) {
				if (file.size <= 1000000)
				{
					var reader = new FileReader();
					reader.onload = function(e) {
						rc.almacenaImagen(reader.result);
					}
					reader.readAsDataURL(file);
				}else {
					toastr.error("Error el archivo supera 1 MB");
					return;
				}
			} else {
				fileDisplayArea1.innerHTML = "File not supported!";
			}			
		});
		
		//JavaScript para agregar la imagen del arreglo
		imagenArreglo.addEventListener('change', function(e) {
			var file = imagenArreglo.files[0];
			var imageType;
			if (file.type == "application/pdf")
					imageType = /application.*/;
			else
					imageType = /image.*/;
			//console.log(imageType);
			if (file.type.match(imageType)) {
				if (file.size <= 1000000)
				{
					var reader = new FileReader();
					reader.onload = function(e) {
						rc.almacenaImagenArreglo(reader.result);
					}
					reader.readAsDataURL(file);
				}else {
					toastr.error("Error el archivo supera 1 MB");
					return;
				}
			} else {
				imagenArreglo.innerHTML = "File not supported!";
			}			
		});
	});
	
	this.publicoGeneral = function(){
		rc.buscar.nombreCliente = "publico";
		if(this.buscar.nombreCliente.length >= 3){
			rc.buscando = true;
		}else{
			rc.buscando = false;
		}
	}
	
	this.esAnonimo = function(venta){
		if(rc.venta.anonimo == true){
			venta.entrega.nombre = "";
		}
	}
	
	this.agregarEnvio = function(colonia_id){
		var colonia = Colonias.findOne(colonia_id)
		rc.venta.total += parseFloat(colonia.precioEnvio) - (parseFloat(rc.venta.precioEnvio) || 0);
		rc.venta.saldo = rc.venta.total - rc.venta.anticipo;
		rc.venta.precioEnvio = colonia.precioEnvio;
	}
};