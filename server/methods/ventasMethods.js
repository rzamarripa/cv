Meteor.methods({
	obtenerVenta : function(venta_id){
		var venta = Ventas.findOne({_id : venta_id});
		venta.cliente = Meteor.users.findOne({_id : venta.cliente_id},{fields : { "profile.nombreCompleto" : 1, "profile.tel1" : 1, "profile.correo" : 1, "profile.calleNum" : 1, "profile.colonia" : 1, "profile.codigoPostal" : 1}});
		venta.sucursal = Sucursales.findOne(venta.sucursal_id);
		
		return venta;
	},
	imprimirTicket : function(cliente_id, sucursal_id, folioActual){
		console.log(folioActual);
		var cliente = Meteor.users.findOne({_id : cliente_id},{fields : {profile : 1}});
		var sucursal = Sucursales.findOne({_id : sucursal_id});
		var venta = Ventas.find({sucursal_id : sucursal_id, folios : { $elemMatch : { $eq: parseInt(folioActual)}}}).fetch();
		var pago = Pagos.find({sucursal_id : sucursal_id, folio : parseInt(folioActual)}).fetch();
		console.log(venta);
		return [cliente, sucursal, venta, pago];
	},
	realizarVenta : function(venta, clienteSeleccionado, caja){
		//Aumentar folio sucursal
		var sucursal = Sucursales.findOne(Meteor.user().profile.sucursal_id);
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
	},
	report: function(params) {

    var objParse = function(datos, obj, prof){
      if(!obj){
        obj = {};
      }
      _.each(datos, function(d, dd){
        var i = prof ? prof + dd : dd;
        if(_.isDate(d)){
          obj[i] = moment(d).format('DD-MM-YYYY');
        }else if(_.isArray(d)){
          obj[i] = arrParse(d, []);
        }else if(_.isObject(d)){
          objParse(d, obj, i+'.');  
        }else{
          obj[i] = d;
        }
      });
      return obj
    };

    var arrParse = function(datos, arr){
      _.each(datos, function(d){
        if(_.isObject(d)) {
          var obj = objParse(d, {});
          arr.push(obj);
        }else{
          arr.push(!_.isDate(d) ? d : moment(d).format('DD-MM-YYYY'));
        }
      });
      return arr
    };
    params.datos = objParse(params.datos);
    var fs = require('fs');
    var path = require('path');
    var basePath = path.resolve('.').split('.meteor')[0];
    var Docxtemplater = require('docxtemplater');
    var JSZip = require('jszip');
    var unoconv = require('unoconv2');
    var future = require('fibers/future');
    var res = new future();
    var templateType = (params.type === 'pdf') ? '.docx' : (params.type === 'excel' ? '.xlsx' : '.docx' );
    var templateRoute = basePath + "public/" + params.templateNombre + templateType;
    var content = fs.readFileSync(templateRoute, "binary");
    var zip = new JSZip(content);
    var doc = new Docxtemplater().loadZip(zip).setOptions({
			nullGetter: function(part) {
        if (!part.module) {
          return "";
        }
        if (part.module === "rawxml") {
          return "";
        }
        return "";
      }
    });
    doc.setData(params.datos);
    doc.render();
    var rutaOutput = basePath + ".outputs/" + params.reportNombre + moment().format('x') + templateType;
    var buf = doc.getZip().generate({ type: "nodebuffer" });
    if(params.type == 'pdf'){
    	fs.writeFileSync(rutaOutput, buf);
    	unoconv.convert(rutaOutput, 'pdf', function(err, result) {
      	fs.unlink(rutaOutput);
      	res['return']({ uri: 'data:application/pdf;base64,' + result.toString('base64'), nombre: params.reportNombre + '.pdf' });
    	});
    }else{
    	var mime;
    	if(templateType === '.xlsx'){
    		mime = 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    	}else{
    		mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    	}
			res['return']({ uri: 'data:application/'+mime+';base64,' + buf.toString('base64'), nombre: params.reportNombre + templateType });
		}
    return res.wait()
  },
  cancelarVenta : function(venta){
	  var idTemp = venta._id;
	  delete venta._id;
	  Ventas.update({_id : idTemp},{ $set : venta});
	  var pagos = Pagos.find({folio : { $in : venta.folios }}).fetch();
	  _.each(pagos, function(pago){
		  Pagos.update({_id : pago._id}, { $set : {estatus : 2, fechaCancelacion : new Date() }});
	  });
	  
	  return true;
  }
});