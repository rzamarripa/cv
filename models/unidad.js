Unidades 						= new Mongo.Collection("unidades");
Unidades.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});