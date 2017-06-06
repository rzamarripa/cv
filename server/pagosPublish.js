Meteor.publish("pagos", function(params){
	return Pagos.find(params);
});

Meteor.publish("pagosCliente",function(options){
	console.log(options);
  return Pagos.find({cliente_id: options.cliente_id, folio : parseInt(options.folioActual)});
});

Meteor.publish("pagosTotales", function(options){
	return Pagos.aggregate([{$group:{_id:{alumno_id: options.alumno_id}, total:{$sum:"$importe"},pagos:{$sum:1}}}]);
});

Meteor.publish("pago",function(options){
  return Alumnos.find(options.id);
});