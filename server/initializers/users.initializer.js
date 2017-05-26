Meteor.startup(function () {
  if (Meteor.users.find().count() === 0) {
    var usuario_id = Accounts.createUser({
      username: 'admin',
      password: '123qwe',
      profile : {
	      nombre: 'Súper Administrador',
	      nombreCompleto: 'Súper Administrador',
	      estatus : true
      }
    });
    
    Roles.addUsersToRoles(usuario_id, 'admin');
    
    var usuario_id = Accounts.createUser({
      username: 'matriz',
      password: '123qwe',
      profile : {
	      nombre: 'Administrador Matríz',
	      nombreCompleto: 'Administrador Matríz',
	      estatus : true
      }
    });
    
    Roles.addUsersToRoles(usuario_id, 'matriz');
  }
});