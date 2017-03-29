Meteor.publish("regiones", function(options){
	return Regiones.find(options);
});