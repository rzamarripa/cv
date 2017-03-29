Meteor.publish("ventas", function(options){
	return Ventas.find(options);
});