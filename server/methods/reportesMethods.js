Meteor.methods({
	prospectosPorMediosPublicidad1: function (fechaInicial, fechaFinal) {
    var medios = MediosPublicidad.find().fetch();
    var arreglo = {};
    fechaInicial = moment(fechaInicial).add(-1, "days");
    
    _.each(medios, function(medio){
	    arreglo[medio.nombre] = {};
			arreglo[medio.nombre].nombre = medio.nombre;
			arreglo[medio.nombre].cantidad = Meteor.users.find({roles : ["cliente"], "profile.fechaCreacion" : {$gte : new Date(fechaInicial), $lte: new Date(fechaFinal)}, "profile.medio_id" : medio._id}).count();
		});
    
    var arregloFinal = {};
    arregloFinal.medios = {};
    
    _.each(arreglo, function(medio){
	    if(arregloFinal.medios[medio.nombre] == undefined){
		    arregloFinal.medios[medio.nombre] = {};
		    arregloFinal.medios[medio.nombre].name = medio.nombre;
		    arregloFinal.medios[medio.nombre].data = [];
		    arregloFinal.medios[medio.nombre].data.push(medio.cantidad);
	    }else{
		    arregloFinal.medios[medio.nombre].data.push(medio.cantidad);
	    }
    })
		
		arregloFinal[medios] = _.toArray(arregloFinal.medios);
		

    return _.toArray(arregloFinal);
  },
	prospectosSoloEtapaVenta: function (fechaInicial, fechaFinal) {    
    var etapasVenta = EtapasVenta.find().fetch();
    var arreglo = {};
    _.each(etapasVenta, function(etapaVenta){
	    if(arreglo[etapaVenta.nombre] == undefined){
				arreglo[etapaVenta.nombre] = {};
				arreglo[etapaVenta.nombre].etapaVenta = etapaVenta.nombre;
				arreglo[etapaVenta.nombre].cantidad = Prospectos.find({"profile.fecha" : {$gte : new Date(fechaInicial.setHours(24)), $lte: new Date(fechaFinal)}, "profile.etapaVenta_id" : etapaVenta._id}).count();
			}
    });
    
    var arregloFinal = {};
    arregloFinal.etapasVenta = [];
		arregl = _.toArray(arreglo);
    return _.toArray(arreglo);
  },
  historialCobranza : function (fechaInicial, fechaFinal, sucursal_id, usuario_id, formaPago) {
	  var query = {};
	  if(usuario_id == "todos" || usuario_id == undefined){
		  if(formaPago == "todos" || formaPago == undefined){
			  query = {sucursal_id : sucursal_id, fechaPago : {$gte : new Date(fechaInicial), $lt: new Date(fechaFinal.setHours(23,59,0))}}
		  }else{
			  query = {formaPago : formaPago, sucursal_id : sucursal_id, fechaPago : {$gte : new Date(fechaInicial), $lt: new Date(fechaFinal.setHours(24))}}
		  }
	  }else{
		  if(formaPago == "todos"  || formaPago == undefined){
			  query = {usuario_id : usuario_id, sucursal_id : sucursal_id, fechaPago : {$gte : new Date(fechaInicial), $lt: new Date(fechaFinal.setHours(24))}}
		  }else{
			  query = {usuario_id : usuario_id, formaPago : formaPago, sucursal_id : sucursal_id, fechaPago : {$gte : new Date(fechaInicial), $lt: new Date(fechaFinal.setHours(24))}}
		  }
	  }	  
	  
		var otrosPagos = Pagos.find(query).fetch(); 
	  
	  _.each(otrosPagos, function(pago){
		  pago.cliente = Meteor.users.findOne({_id : pago.cliente_id});
		  pago.usuarioInserto = Meteor.users.findOne({_id : pago.usuario_id});
	  });
	  
	  return otrosPagos;
  },
  reporteComisionesGerentes : function(semana, anio, seccion_id, campus_id){
		dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
		//Busco las comisiones de los gerentes
	  var comisionesGerente = Comisiones.find({semanaPago : semana, anioPago : anio, seccion_id : seccion_id, beneficiario : "gerente"}).fetch();
	  var arreglo = {};
	  
	  //Agrupo las comisiones por cada gerente
	  _.each(comisionesGerente, function(comision){
		  if(arreglo[comision.gerente_id] == undefined){
			   arreglo[comision.gerente_id] = {};
			   arreglo[comision.gerente_id].gerente = Meteor.users.findOne(comision.gerente_id, {fields : {profile : 1}});
			   arreglo[comision.gerente_id].cantidad = 1;
			   arreglo[comision.gerente_id].semana = comision.semana;
			   arreglo[comision.gerente_id].beneficiario = comision.beneficiario;
			   arreglo[comision.gerente_id].dias = {};
			   _.each(dias, function(dia){
				   arreglo[comision.gerente_id].dias[dia] = 0;
			   })
			   arreglo[comision.gerente_id].dias[dias[comision.diaPago]] = 1;
			   
		  }else{
			   arreglo[comision.gerente_id].cantidad += 1;
			   if(arreglo[comision.gerente_id].dias[dias[comision.diaPago]] == undefined){
				   arreglo[comision.gerente_id].dias = {};
				   arreglo[comision.gerente_id].dias[dias[comision.diaPago]] = 0;
			   }else{
				   arreglo[comision.gerente_id].dias[dias[comision.diaPago]] += 1;
			   }
			   
		  }
	  });
	  arreglo = _.toArray(arreglo);

		//Aplico las reglas de comisión por cada gerente
	  _.each(arreglo, function(gerente){
		  var g = Meteor.users.findOne(gerente.gerente._id);
			_.each(g.profile.planComision, function(concepto){
				switch(concepto.signo){
					case "<=" :
						if(gerente.cantidad >= concepto.cantInicial && gerente.cantidad <= concepto.cantFinal){
							gerente.importe = gerente.cantidad * concepto.importe;
						}
						break;
					case ">=" :
						if(gerente.cantidad >= concepto.cantInicial && gerente.cantidad >= concepto.cantFinal){
							gerente.importe = gerente.cantidad * concepto.importe;
						}
						break;
				}
			});
	  });	  
	  
	  return arreglo;
	  
	},
	reporteComisionesVendedores : function(semana, anio, seccion_id, campus_id){
		dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
	  var arreglo = {};
	  //Busco las comisiones de los vendedores
	  var comisionesVendedores = Comisiones.find({semanaPago : semana, anioPago : anio, seccion_id : seccion_id, beneficiario : "vendedor"}).fetch();
	  
	  //Agrupo las comisiones por cada vendedor
	  _.each(comisionesVendedores, function(comision){
		  if(arreglo[comision.vendedor_id] == undefined){
			   arreglo[comision.vendedor_id] = {};
			   arreglo[comision.vendedor_id].vendedor = Meteor.users.findOne(comision.vendedor_id, {fields : {profile : 1}});
			   arreglo[comision.vendedor_id].cantidad = 1;
			   arreglo[comision.vendedor_id].semana = comision.semana;
			   arreglo[comision.vendedor_id].beneficiario = comision.beneficiario;
			   arreglo[comision.vendedor_id].comision = comision.importeComision;
			   arreglo[comision.vendedor_id].dias = {};
			   _.each(dias, function(dia){
				   arreglo[comision.vendedor_id].dias[dia] = 0;
			   })
			   arreglo[comision.vendedor_id].dias[dias[comision.diaPago]] = 1;
		  }else{
			   arreglo[comision.vendedor_id].cantidad += 1;
			   arreglo[comision.vendedor_id].comision += comision.importeComision;
			   if(arreglo[comision.vendedor_id].dias[dias[comision.diaPago]] == undefined){
				   arreglo[comision.vendedor_id].dias = {};
				   arreglo[comision.vendedor_id].dias[dias[comision.diaPago]] = 0;
			   }else{
				   arreglo[comision.vendedor_id].dias[dias[comision.diaPago]] += 1;
			   }
			   
		  }
	  });
	  arreglo = _.toArray(arreglo);

		//Aplico las reglas de bonos por cada vendedor
		var conceptosComision = ConceptosComision.find({seccion_id : seccion_id, estatus : true}).fetch();
	  _.each(arreglo, function(vendedor){
			_.each(conceptosComision, function(concepto){
				switch(concepto.signo){
					case "<=" :
						if(vendedor.cantidad >= concepto.cantInicial && vendedor.cantidad <= concepto.cantFinal){
							vendedor.bono = concepto.importe;
						}
						break;
					case ">=" :
						if(vendedor.cantidad >= concepto.cantInicial && vendedor.cantidad >= concepto.cantFinal){
							vendedor.bono = concepto.importe;
						}
						break;
				}
			});
			vendedor.total = vendedor.bono + vendedor.comision;
	  });	  
	  
	  return arreglo;
	  
	}
})

