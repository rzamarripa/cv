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
	  },
	  colonias : () => {
		  return Colonias.find();
	  }
  });
  
  	
	this.guardar = function(venta, form)
	{
		_.each(rc.venta.detalleProducto, function(producto, indice){
			delete producto.$$hashKey;
		});	
		
		//Aumentar folio sucursal
		var sucursal = Sucursales.findOne();
		var folioActual = sucursal.folioActual + 1;
				
		var total = 0;
		rc.venta.sucursal_id = Meteor.user().profile.sucursal_id;
		rc.venta.estatus = 1;
		rc.venta.fechaCreacion = new Date();
		rc.venta.folios = [folioActual];
		rc.venta.pagado = 0;
		rc.venta.anticipo = parseFloat(rc.venta.anticipo);
		rc.venta.entrega.nombreCliente = rc.clienteSeleccionado.profile.nombreCompleto;
		
		console.log("datos del pedido", rc.venta);
		
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		
		if(rc.venta.anticipo <= 0 && rc.anticipoCero == false){
			rc.anticipoCero = true;
			return
		}
		
		if(rc.venta.formaPago == undefined){
			toastr.warning("Seleccione la forma de pago");
			return;
		}
		
		if(rc.venta.anticipo <= 0){
			//No pagó nada
			rc.venta.estatusPago = 0;
		}else if(rc.venta.saldo == 0){
			//Pago todo
			rc.venta.estatusPago = 2;
		}else{
			//Pago anticipo
			rc.venta.estatusPago = 1;
		}
		
		if(rc.clienteSeleccionado.profile.estatus == "1"){
			rc.clienteSeleccionado.profile.estatus == "2";
			
			Meteor.users.update({_id : rc.clienteSeleccionado._id},{$set : {profile : rc.clienteSeleccionado.profile}});
		}

		var venta_id = Ventas.insert(rc.venta);
		
		Pagos.insert({
			folio : folioActual,
			venta_id : venta_id,
			pago : venta.anticipo,
			saldo : venta.saldo,
			total : venta.total,
			fechaPago : new Date(),
			sucursal_id : venta.sucursal_id,
			estatus : 1,
			cliente_id : venta.cliente_id,
			formaPago : venta.formaPago,
			usuario_id : Meteor.userId()			
		});
		
		Sucursales.update({_id : sucursal._id},{$set: {folioActual : folioActual}});
		
		toastr.success('Venta realizada.');
		this.clienteSeleccionado = {};
		this.buscar.nombreCliente = "";
		this.venta = {};
		this.venta.detalle = [];
		this.venta.total = 0;
		this.venta.anticipo = 0;
		this.venta.saldo = 0;
		$('.collapse').collapse('hide');
		this.nuevo = true;
		//$state.go('root.productos');
		
		var url = $state.href("anon.pagosImprimir",{sucursal_id : venta.sucursal_id, folioActual : folioActual, cliente_id : venta.cliente_id},{newTab : true});
		window.open(url,'_blank');
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
	  console.log(rc.venta.anticipo);
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
		  Meteor.apply("validarContrasena", [Meteor.user().username, contrasena], function(error, result){
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
  
  $(document).ready( function() {
		var comprobante = document.getElementById('comprobante');			
		var fileDisplayArea1 = document.getElementById('fileDisplayArea1');
		//JavaScript para agregar la imagen
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
};