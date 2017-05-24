angular.module("casserole").controller("RootCtrl", RootCtrl);  
function RootCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope); 
	this.avisosVentana = "none";
	this.grupos_id = [];
	this.hoy = new Date();
	this.usuarioActual = {};
	
	if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] == "encargado"){
		
		this.subscribe('cajas', function(){
			return [{
				sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""
			}]
		});
		
		this.subscribe('sucursales', function(){
			return [{
				_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""
			}]
		});
	
		this.helpers({
			sucursal : () => {
			  return Sucursales.findOne(Meteor.user().profile.sucursal_id);
			},
			usuarioActual : () => {
				return Meteor.user();
			},
			cajas : () =>{
				var cajas = Cajas.find().fetch();
				var hayAbiertas = false;
				if(cajas.length > 0){
					_.each(cajas, function(caja){
						if(caja && caja.estatus && caja.usuario_id == Meteor.userId() && caja.abierta == true){
							hayAbiertas = true;
							return;
						}
					})
					
					if(hayAbiertas){
						toastr.success("Bienvenido, su caja está abierta");						
					}else{
						toastr.warning("Bienvenido, tiene que abrir una caja para iniciar");
						$state.go("root.cajas");
					}
				}
				return cajas;
			}
		});
	}else{
		this.subscribe('sucursales', function(){
			return [{
				_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""
			}]
		});
	
		this.helpers({
			sucursal : () => {
			  return Sucursales.findOne(Meteor.user().profile.sucursal_id);
			},
			usuarioActual : () => {
				return Meteor.user();
			}
		});
	}
	
	//if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] == "gerente"){
		// Gerente
		
	//}
	
	this.autorun(function() {
 	
    if(!Meteor.user()){
	    toastr.success("Se deslogueó por inactividad");
    	$state.go('anon.login');
    }
    
  });
  
	this.muestraAvisos = function(){
	  if(rc.avisosVentana == "none"){
		  rc.avisosVentana = "block";
	  }else{
		  rc.avisosVentana = "none";
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
  };
	
};