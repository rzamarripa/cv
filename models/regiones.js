Regiones					= new Mongo.Collection("regiones");
Regiones.allow({
  insert: function (userId, doc) { return !Roles.userIsInRole(userId, 'cliente'); },
  update: function (userId, doc) { return !Roles.userIsInRole(userId, 'cliente'); },
  remove: function (userId, doc) { return !Roles.userIsInRole(userId, 'cliente'); }
});