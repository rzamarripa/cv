Meteor.publish("materiales",function(){
  	return Materiales.find({}, {sort: {nombre: 1}});
  	//return Gizmos.find({}, {sort: { name: 1 }});
});