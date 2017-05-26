Meteor.publish("solicitudes", function(params){
	console.log(params);
	return Solicitudes.find(params);
});