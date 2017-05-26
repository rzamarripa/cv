Meteor.methods({
	obtenerSolicitud : function(venta_id){
		var venta = Ventas.findOne({_id : venta_id});
		venta.cliente = Meteor.users.findOne({_id : venta.cliente_id},{fields : { "profile.nombreCompleto" : 1, "profile.tel1" : 1, "profile.correo" : 1, "profile.calleNum" : 1, "profile.colonia" : 1, "profile.codigoPostal" : 1}});
		venta.sucursal = Sucursales.findOne(venta.sucursal_id);
		
		return venta;
	},
	obtenerSolicitudes : function(folios){
		var solicitudes = Solicitudes.find({folio : { $in : folios}}).fetch();
		_.each(solicitudes, function(solicitud){
			solicitud.solicitante = Meteor.users.findOne(solicitud.usuario_id, { profile : 1});
		})
		return solicitudes;
	},
	guardarSolicitud : function(solicitud){
		solicitud.fechaCreacion = new Date();
		var configuracion = Configuracion.findOne();
		solicitud.folio = configuracion.folioPedidos + 1;
		var solicitud_id = Solicitudes.insert(solicitud);
		Configuracion.update({_id : configuracion._id},{ $set : { folioPedidos : configuracion.folioPedidos + 1}});
		return solicitud_id;
	},
	cantidadSolicitudes : function(fechaInicial, fechaFinal){
		console.log(fechaInicial, fechaFinal);
		var solicitudesPendientes = Solicitudes.find({estatus : 1}).count();
		var solicitudesEnviados = Solicitudes.find({estatus : 2}).count();
		var solicitudesEntregados = Solicitudes.find({estatus : 3, fechaCreacion : { $gte : fechaInicial, $lt: fechaFinal}}).count();
		var solicitudesCanceladas = Solicitudes.find({estatus : 4, fechaCreacion : { $gte : fechaInicial, $lt: fechaFinal}}).count();
		console.log([solicitudesPendientes, solicitudesEnviados, solicitudesEntregados])
		return [solicitudesPendientes, solicitudesEnviados, solicitudesEntregados, solicitudesCanceladas];
	},
	cantidadSolicitudesSucursal : function(fechaInicial, fechaFinal, sucursal_id){
		console.log(fechaInicial, fechaFinal);
		var solicitudesPendientes = Solicitudes.find({estatus : 1, sucursal_id : sucursal_id}).count();
		var solicitudesEnviados = Solicitudes.find({estatus : 2, sucursal_id : sucursal_id}).count();
		var solicitudesEntregados = Solicitudes.find({estatus : 3, sucursal_id : sucursal_id, fechaCreacion : { $gte : fechaInicial, $lt: fechaFinal}}).count();
		var solicitudesCanceladas = Solicitudes.find({estatus : 4, sucursal_id : sucursal_id, fechaCreacion : { $gte : fechaInicial, $lt: fechaFinal}}).count();
		console.log([solicitudesPendientes, solicitudesEnviados, solicitudesEntregados])
		return [solicitudesPendientes, solicitudesEnviados, solicitudesEntregados, solicitudesCanceladas];
	}
});