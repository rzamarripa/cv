
angular
  .module('casserole')
  .controller('ClientesCtrl', ClientesCtrl);
 
function ClientesCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.cliente = {};
  this.cliente.profile = {};
  this.cliente.profile.usuario = "";
  this.buscar = {};
  this.buscar.nombre = '';
  this.clientes = [];
  
  window.rc = rc;
  
  this.subscribe('ocupaciones',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe('cantidadClientes',()=>{
		return [{estatus:true, region_id : Meteor.user() != undefined ? Meteor.user().profile.region_id : ""}]
	});
	
	this.subscribe("mediosPublicidad",()=>{
		return [{estatus:true }]
	});
  
	this.helpers({
		mediosPublicidad : () => {
			return MediosPublicidad.find({},{sort : {nombre : 1}});
		},
	  ocupaciones : () => {
		  return Ocupaciones.find({estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""});
	  },
	  cantidad : () => {
			 var x = Counts.get('number-clientes');
			 return x;
	  },
	  usuario : () => {
		  if(Meteor.user()){
			  var usuarioAnterior = 0;
			  anio = '' + new Date().getFullYear();
			  anio = anio.substring(2,4);
			  if(this.getReactively("cantidad") > 0){
			  	var usuarioOriginal = anio + Meteor.user().profile.region_clave+"0000";
			  	var usuarioOriginalN = parseInt(usuarioOriginal);
			  	var usuarioNueva = usuarioOriginalN+this.cantidad+1;
			  	usuarioNueva = 'c'+usuarioNueva
					rc.cliente.username = usuarioNueva;
				  rc.cliente.profile.usuario = usuarioNueva;
				  
			  }else{
				  rc.cliente.username = "c" + anio + Meteor.user().profile.region_clave + "0001";
				  rc.cliente.profile.usuario = "c" + anio + Meteor.user().profile.region_clave + "0001";
			  }
		  }
	  }
  });
  
  this.guardar = function (cliente,form) {
		if(form.$invalid){
			this.validation = true;
      toastr.error('Error al guardar los datos.');
      return;
    }
    
    delete cliente.profile.repeatPassword;
		cliente.profile.estatus = "1";
		var nombre = cliente.profile.nombre != undefined ? cliente.profile.nombre + " " : "";
		var apPaterno = cliente.profile.apPaterno != undefined ? cliente.profile.apPaterno + " " : "";
		var apMaterno = cliente.profile.apMaterno != undefined ? cliente.profile.apMaterno : "";
		cliente.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		cliente.profile.fechaCreacion = new Date();
		cliente.profile.region_id = Meteor.user().profile.region_id;
		cliente.profile.sucursal_id = Meteor.user().profile.sucursal_id;
		cliente.profile.usuarioInserto_id = Meteor.userId();
		Meteor.call('createUsuario', rc.cliente, 'cliente');
		toastr.success('Guardado correctamente.');
		//$state.go('root.clientes');			
		this.nuevo = true;
	};
	
	this.tomarFoto = function () {
		$meteor.getPicture({width:200, height: 200, quality: 50}).then(function(data){			
			rc.cliente.fotografia = data;
		})
	};
	
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
  };
  
  this.buscarClientes = function(){
	  console.log(this.buscar.nombre);
	  if(this.buscar.nombre.length > 3 ){
		  Meteor.apply('buscarClientes', [{
			    options : { limit: 51 },
			    where : { 
						nombreCompleto : this.getReactively('buscar.nombre'), 
					} 		   
		    }], function(error, result){
			  if(result){
				  console.log("result", result)
				  rc.clientes = result;
				  NProgress.set(1);
			  }
		
		    $scope.$apply();
		  });
	  }else{
		  rc.clientes = [];
	  }
  }
  
  this.getFocus = function(){
	  document.getElementById('buscar').focus();
  };  
  
  this.obtenerColorEstatus = function(estatus){
	  if(estatus == 1){ //Registrado
		  return "bg-color-blue txt-white";
	  }else if(estatus == 2){
		  return "bg-color-purple txt-white"
	  }else if(estatus == 3){
		  return "bg-color-yellow txt-white"
	  }else if(estatus == 4){
		  return "bg-color-blueLight txt-white"
	  }else if(estatus == 5){
		  return "bg-color-greenLight txt-white"
	  }else if(estatus == 6){
		  return "bg-color-red txt-white"
	  }else if(estatus == 7){
		  return "bg-color-blueDark txt-white"
	  }else if(estatus == 8){
		  return "label-primary txt-white"
	  }
  }
  
  this.obtenerNombreEstatus = function(estatus){
	  if(estatus == 1){ //Registrado
		  return "Registrado";
	  }else if(estatus == 2){
		  return "Inicio"
	  }else if(estatus == 3){
		  return "Pospuesto"
	  }else if(estatus == 4){
		  return "Fantasma"
	  }else if(estatus == 5){
		  return "Activo"
	  }else if(estatus == 6){
		  return "Baja"
	  }else if(estatus == 7){
		  return "Term.Pago"
	  }else if(estatus == 8){
		  return "Egresado"
	  }
  }
}