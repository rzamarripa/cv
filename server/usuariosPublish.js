/*
Meteor.publish("gerentesVenta", function(){
	return Roles.getUsersInRole( 'gerenteVenta');
});
*/

Meteor.publish("usuarios", function(options){
	return  Meteor.users.find(options);
});

/*
Meteor.publish("coordinadores", function(){
	return Roles.getUsersInRole( ['coordinadorAcademico', 'coordinadorFinanciero'] );
});
*/

Meteor.publish("usuariosMensajes", function(options){
	return Roles.getUsersInRole(['coordinadorAcademico', 'coordinadorFinanciero', 'maestro', 'director']);
});

Meteor.publish("todosUsuarios", function(options){
	return Roles.getUsersInRole(['gerente', 'director']);
});

Meteor.publish("validaUsuarios", function(){
	return Roles.getUsersInRole( ['director', 'coordinadorFinanciero', 'coordinadorAcademico', 'gerenteVenta', 'vendedor', 'recepcionista'] );
});

Meteor.publish("usuariosProduccion", function(){
	return Roles.getUsersInRole( ['produccion'] );
});

Meteor.publish("usuariosReparto", function(){
	return Roles.getUsersInRole( ['repartidor'] );
});

Meteor.publish("gerentesVenta", function(options){
	return Meteor.users.find(options)
});

Meteor.publish("coordinadores", function(options){
	return Meteor.users.find(options)
});

Meteor.publish("recepcionistas", function(options){
	return Meteor.users.find(options)
});