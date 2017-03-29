Sucursales 						= new Mongo.Collection("sucursales");
Sucursales.allow({
  insert: function (userId, doc) { return !Roles.userIsInRole(userId, 'cliente'); },
  update: function (userId, doc) { return !Roles.userIsInRole(userId, 'cliente'); },
  remove: function (userId, doc) { return !Roles.userIsInRole(userId, 'cliente'); }
});