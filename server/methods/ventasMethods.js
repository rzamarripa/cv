Meteor.methods({
	obtenerVenta : function(venta_id){
		var venta = Ventas.findOne({_id : venta_id});
		venta.cliente = Meteor.users.findOne({_id : venta.cliente_id},{fields : { "profile.nombreCompleto" : 1, "profile.tel1" : 1, "profile.correo" : 1, "profile.calleNum" : 1, "profile.colonia" : 1, "profile.codigoPostal" : 1}});
		venta.sucursal = Sucursales.findOne(venta.sucursal_id);
		
		return venta;
	},
	imprimirTicket : function(cliente_id, sucursal_id, folioActual){
		var cliente = Meteor.users.findOne({_id : cliente_id},{fields : {profile : 1}});
		var sucursal = Sucursales.findOne({_id : sucursal_id});
		var venta = Ventas.find({sucursal_id : sucursal_id, folios : { $elemMatch : { $eq: folioActual}}}).fetch();
		var pago = Pagos.find({sucursal_id : sucursal_id, folio : parseInt(folioActual)}).fetch();
		
		return [cliente, sucursal, venta, pago];
	}
});