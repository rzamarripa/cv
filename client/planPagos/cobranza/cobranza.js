angular
.module("casserole")
.controller("CobranzaCtrl", CobranzaCtrl);
function CobranzaCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.semanaActual = moment().isoWeek();
  this.anioActual = moment().get("year");
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,59,0)
  this.otrosCobros = [];
  this.totales = 0.00;
  this.cobrosPorFormaPago = {};
  window.rc = rc;
  
  this.subscribe('todosUsuarios',()=>{
		return [{"profile.sucursal_id" : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", roles : {$ne : ["cliente"]}}]
	});
	
	this.helpers({
		usuarios : () => {
			return Meteor.users.find().fetch();
		},
		usuariosSucursal : () => {
			var usuariosDeAqui = [];
			if(this.getReactively("usuarios") != undefined){
				_.each(rc.getReactively("usuarios"), function(usuario, index){
					if(usuario.profile.sucursal_id == Meteor.user().profile.sucursal_id){
						usuariosDeAqui.push(usuario);
					}
				})
			}
			return usuariosDeAqui;
		}
	});
	
	this.calcularCobros = function(fechaInicial, fechaFinal, usuario_id, formaPago, form){
		console.log(this.fechaInicial, this.fechaFinal, usuario_id, formaPago, form);
		NProgress.set(0.5);
		if(form.$invalid){
			toastr.error('Error al enviar los datos, por favor llene todos los campos.');
			NProgress.set(1);
			return;
    }
		this.totales = 0.00;
		Meteor.apply('historialCobranza', [this.fechaInicial, this.fechaFinal, Meteor.user().profile.sucursal_id, usuario_id, formaPago], function(error, result){
		  var cobrosPorFormaPago = {};
		  _.each(result, function(cobro){
			  rc.totales += cobro.pago;
			  if(cobrosPorFormaPago[cobro.formaPago] == undefined){
					cobrosPorFormaPago[cobro.formaPago] = {};
					cobrosPorFormaPago[cobro.formaPago].formaPago = cobro.formaPago;
					cobrosPorFormaPago[cobro.formaPago].total = cobro.pago;
				}else{
					cobrosPorFormaPago[cobro.formaPago].total += cobro.pago;
				}
		  });
		  
			rc.cobrosPorFormaPago = cobrosPorFormaPago;
		  rc.otrosCobros = result;
		  NProgress.set(1);
	    $scope.$apply();
	  });
	}
};