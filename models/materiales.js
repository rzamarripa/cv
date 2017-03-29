Materiales 						= new Mongo.Collection("materiales");
Materiales.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});