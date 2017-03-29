Meteor.publish("cliente",function(options){
  return Meteor.users.find(options.id);
});

Meteor.publish("clientesNombre",function(options){
	if(options.nombreCompleto != undefined){
		let selector = {
	  	"profile.nombreCompleto": { '$regex' : '.*' + options.nombreCompleto || '' + '.*', '$options' : 'i' },
	  	roles : ["cliente"],
	  	"profile.estatus" : options.estatus
		}
	  return Meteor.users.find(selector);
	}
	
});

Meteor.publish("cantidadClientes",function(options){
	Counts.publish(this, 'number-clientes',Meteor.users.find({roles : ["cliente"],'profile.region_id':options.region_id}),{noReady: true});	
});

Meteor.publish("buscarUsuario",function(options){
	if(options.where.nombreUsuario.length > 3){		
		return Meteor.users.find({username : options.where.nombreUsuario});
	}	
});