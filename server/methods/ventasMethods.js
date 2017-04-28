Meteor.methods({
	obtenerVenta : function(venta_id){
		var venta = Ventas.findOne({_id : venta_id});
		venta.cliente = Meteor.users.findOne({_id : venta.cliente_id},{fields : { "profile.nombreCompleto" : 1, "profile.tel1" : 1, "profile.correo" : 1, "profile.calleNum" : 1, "profile.colonia" : 1, "profile.codigoPostal" : 1}});
		venta.sucursal = Sucursales.findOne(venta.sucursal_id);
		
		return venta;
	}
})