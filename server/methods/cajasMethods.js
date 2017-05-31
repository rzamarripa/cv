Meteor.methods({
	confirmarAbrirCaja : function(caja, usuario_id, saldoActual, saldoInicial, confirmarSaldo, saldoAnterior){
		if(confirmarSaldo){
			var usuarioAnterior = Meteor.users.findOne(caja.usuarioCierre_id);
			var usuarioActual = Meteor.users.findOne(usuario_id);
			var sucursal = Sucursales.findOne(caja.sucursal_id);
			var gerente = Meteor.users.findOne({"profile.sucursal_id" : sucursal._id, roles : ["gerente"]});
			console.log(usuarioAnterior, usuarioActual, sucursal, gerente)
			if(caja.usuarioCierre_id != ""){
				Meteor.call('sendEmail',
					gerente.profile.correo,
					'sistema@corazonvioleta.mx',
					'Bienvenido a Corazón de Violeta',
					'El usuario ' + usuarioActual.profile.nombreCompleto + ' dice que recibe ' + saldoInicial + ', cuando ' + usuarioAnterior.profile.nombreCompleto + ' dice que dejó en la caja ' + caja.nombre + ' la cantidad de ' + saldoAnterior + '.'
				);	
			}
		}
			
		Cajas.update(caja._id, { $set : { usuario_id :usuario_id, saldoActual : saldoActual, abierta : true, saldoInicial : saldoInicial}});
		return true;
	}
});