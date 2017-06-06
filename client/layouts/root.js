angular.module("casserole").controller("RootCtrl", RootCtrl);  
function RootCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope); 
	this.avisosVentana = "none";
	this.grupos_id = [];
	this.hoy = new Date();
	this.usuarioActual = {};
	
	if(Meteor.user() && Meteor.user().roles && Meteor.user().roles[0] == "gerente"){
		// Gerente
		this.subscribe('sucursales', function(){
			return [{
				_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""
			}]
		});
		
		this.subscribe('avisos', function(){
			return [{
				estatus : true
			}]
		});
	
		this.helpers({
			sucursal : () => {
			  return Sucursales.findOne(Meteor.user().profile.sucursal_id);
			},
			avisos : () => {
			  return Avisos.find();
			},
			usuarioActual : () => {
				return Meteor.user();
			}
		});
	}
	
	this.autorun(function() {
 	
    if(!Meteor.user() && Meteor.user()._id){
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
	
	this.cambiarEstatus = function(aviso_id){
		var aviso = MensajesVendedores.findOne(aviso_id);
		if(aviso){
			MensajesVendedores.update({_id : aviso_id}, { $set : {estatus : !aviso.estatus}});
			if(aviso.estatus){
				toastr.success("Mensaje leído.");
			}else{
				toastr.info("Mensaje no leído");
			}
		}
	}
};