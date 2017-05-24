Meteor.publish("cajas", function(options){
	return Cajas.find(options);
});