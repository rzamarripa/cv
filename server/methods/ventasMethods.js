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
	},
	realizarVenta : function(venta, clienteSeleccionado, caja){
		//Aumentar folio sucursal
		var sucursal = Sucursales.findOne(Meteor.user().profile.sucursal_id);
		console.log(sucursal);
		var folioActual = sucursal.folioActual + 1;
		
		var total = 0;
		venta.sucursal_id = Meteor.user().profile.sucursal_id;
		venta.estatus = 1;
		venta.fechaCreacion = new Date();
		venta.folios = [folioActual];
		venta.pagado = 0;
		venta.anticipo = parseFloat(venta.anticipo) || 0;
		if(venta.saldo == undefined){
			venta.saldo = venta.total;
		}
		
		caja.saldoActual = parseFloat(caja.saldoActual) + parseFloat(venta.anticipo);
		caja.folios.push({folio : folioActual, usuario_id : Meteor.userId()});
		
		Cajas.update({_id : caja._id}, { $set : {saldoActual : caja.saldoActual, folios : caja.folios}});
		
		venta.entrega.nombreCliente = clienteSeleccionado.profile.nombreCompleto;
		
		if(venta.anticipo <= 0){
			//No pagó nada
			venta.estatusPago = 0;
		}else if(venta.saldo == 0){
			//Pago todo
			venta.estatusPago = 2;
			venta.enProduccion = true;
		}else{
			//Pago anticipo
			venta.estatusPago = 1;
		}
		
		if(clienteSeleccionado.profile.estatus == "1"){
			clienteSeleccionado.profile.estatus == "2";
			
			Meteor.users.update({_id : clienteSeleccionado._id},{$set : {profile : clienteSeleccionado.profile}});
		}

		var venta_id = Ventas.insert(venta);
		
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
		
		return venta;
	},
	getVentasPorFolios : function(folios){
		var pagos = Pagos.find({folio : { $in : folios}}).fetch();
		_.each(pagos, function(pago){
			pago.cliente = Meteor.users.findOne(pago.cliente_id, { profile : 1});
			pago.venta = Ventas.findOne(pago.venta_id);
		})
		return pagos;
	}
});