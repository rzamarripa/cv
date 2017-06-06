angular
.module("casserole")
.controller("UsuariosRepartoCtrl", UsuariosRepartoCtrl);
function UsuariosRepartoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;
  this.usuario = {};
	this.validaContrasena = false;
	this.cambiarPassword = true;
	
	
	window.rc = rc;
	
	$(document).ready(function() {
	  $(".select2").select2({
		  tags: true
	  });
	});
	
	this.subscribe('usuariosReparto', ()=>{
		return [{}]
	});
	
	this.subscribe('colonias', ()=>{
		return [{estatus : true, sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""}];
	});	

  this.helpers({
	  usuariosProduccion : () => {
		  return Meteor.users.find({"profile.sucursal_id" : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", roles : ["repartidor"]});
	  },
	  colonias : () => {
		  return Colonias.find();
	  }
  });  
  
  this.nuevoUsuario = function()
  {
		this.action = true;
    this.nuevo = !this.nuevo;
    this.usuario = {}; 
    this.usuario.profile = {};
  };
 
	this.guardar = function(usuario,form)
	{		
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }

		usuario.profile.estatus = true;
		usuario.profile.sucursal_id = Meteor.user().profile.sucursal_id;
		usuario.profile.usuarioInserto = Meteor.userId();
		usuario.profile.nombreCompleto = usuario.profile.nombre  + " " + usuario.profile.apPaterno + " " + (usuario.profile.apMaterno ? usuario.profile.apMaterno : "");
		console.log(usuario);
		Meteor.call('createUsuario', usuario, 'repartidor', function(error, result){
			if(error){
				toastr.error('Error al guardar los datos.');
				console.log(error);
			}else{
				toastr.success('Guardado correctamente.');
				rc.nuevo = true;
				rc.usuario = {};
				$('.collapse').collapse('hide');
			}
		});
	};
	
	this.editar = function(id)
	{
    this.usuario = Meteor.users.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
    this.usernameSeleccionado = this.usuario.username;
    this.validaUsuario = true;
	};
	
	this.actualizar = function(usuario,form)
	{
		if(form.$invalid){
      toastr.error('Error al actualizar los datos.');
      return;
		}
		
		usuario.profile.nombreCompleto = usuario.profile.nombre  + " " + usuario.profile.apPaterno + " " + (usuario.profile.apMaterno ? usuario.profile.apMaterno : "");
		console.log(usuario);
		Meteor.call('updateUsuario', usuario, "repartidor");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		this.validaUsuario = false;
		this.validaContrasena = false;
	};
		
	this.tomarFoto = function(){
		$meteor.getPicture({width:200, height: 200, quality: 50}).then(function(data){
			rc.usuario.profile.fotografia = data;
		});
	};	
	
	this.validarContrasena = function(contrasena, confirmarContrasena){
		if(contrasena && confirmarContrasena){
			if(contrasena === confirmarContrasena && contrasena.length > 0 && confirmarContrasena.length > 0){
				rc.validaContrasena = true;
			}else{
				rc.validaContrasena = false;
			}
		}
	}
	
	this.cambiarContrasena = function(){
		this.cambiarPassword = !this.cambiarPassword;
		if(this.usuario.cambiarContrasena == false){
			rc.usuario.password = undefined;
			rc.usuario.confirmarContrasena = undefined;
		}else{
			rc.usuario.password = "";
			rc.usuario.confirmarContrasena = "";
		}
	}
	
	this.cambiarEstatus = function(id)
	{
		var usuario = Meteor.users.findOne({_id:id});
		if(usuario.profile.estatus == true)
			usuario.profile.estatus = false;
		else
			usuario.profile.estatus = true;
		Meteor.call('modificarUsuario', usuario, "repartidor");
  };
	
};