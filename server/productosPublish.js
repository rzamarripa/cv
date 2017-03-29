Meteor.publish("productos",function(params){
  		return Productos.find(params,{}, {sort: {nombre: 1}});
  		});