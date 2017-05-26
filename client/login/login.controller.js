angular
  .module('casserole')
  .controller('LoginCtrl', LoginCtrl);
 
function LoginCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	
  this.credentials = {
    username: '',
    password: ''
  };
  
  $(document).ready( function() {
		particlesJS('particles-js',
   {
	  "particles": {
	    "number": {
	      "value": 80,
	      "density": {
	        "enable": true,
	        "value_area": 800
	      }
	    },
	    "color": {
	      "value": "#ffffff"
	    },
	    "shape": {
	      "type": "image",
	      "stroke": {
	        "width": 0,
	        "color": "#000000"
	      },
	      "polygon": {
	        "nb_sides": 5
	      },
	      "image": {
	        "src": "http://2.bp.blogspot.com/-CiDnsUSprVU/T1fOmi9n_GI/AAAAAAAAAPY/TsjQC59MP5k/s1600/Corazon_.png",
	        "width": 100,
	        "height": 100
	      }
	    },
	    "opacity": {
	      "value": 0.5,
	      "random": false,
	      "anim": {
	        "enable": false,
	        "speed": 2,
	        "opacity_min": 0.1,
	        "sync": false
	      }
	    },
	    "size": {
	      "value": 11.83721462448409,
	      "random": true,
	      "anim": {
	        "enable": false,
	        "speed": 0,
	        "size_min": 0.1,
	        "sync": true
	      }
	    },
	    "line_linked": {
	      "enable": true,
	      "distance": 150,
	      "color": "#8d2e93",
	      "opacity": 0.4,
	      "width": 1
	    },
	    "move": {
	      "enable": true,
	      "speed": 4,
	      "direction": "none",
	      "random": false,
	      "straight": false,
	      "out_mode": "out",
	      "bounce": false,
	      "attract": {
	        "enable": false,
	        "rotateX": 236.7442924896818,
	        "rotateY": 1200
	      }
	    }
	  },
	  "interactivity": {
	    "detect_on": "canvas",
	    "events": {
	      "onhover": {
	        "enable": true,
	        "mode": "repulse"
	      },
	      "onclick": {
	        "enable": true,
	        "mode": "repulse"
	      },
	      "resize": true
	    },
	    "modes": {
	      "grab": {
	        "distance": 400,
	        "line_linked": {
	          "opacity": 1
	        }
	      },
	      "bubble": {
	        "distance": 400,
	        "size": 40,
	        "duration": 2,
	        "opacity": 8,
	        "speed": 3
	      },
	      "repulse": {
	        "distance": 130.65698670629592,
	        "duration": 0.4
	      },
	      "push": {
	        "particles_nb": 4
	      },
	      "remove": {
	        "particles_nb": 2
	      }
	    }
	  },
	  "retina_detect": true
	}
);
	});

  this.login = function () {
	  $meteor.loginWithPassword(rc.credentials.username, rc.credentials.password, function(error){
		  if(error){
			  if(error.reason == "Match failed"){
		      toastr.error("Escriba su usuario y contraseña para iniciar");
	      }else if(error.reason == "User not found"){
		      toastr.error("Usuario no encontrado");
	      }else if(error.reason == "Incorrect password"){
		      toastr.error("Contraseña incorrecta");
	      }  
		  }else{
			  Meteor.apply('usuarioActivo', [rc.credentials.username], function(error, result){
				  if(result != 6){
					  toastr.success("Bienvenido al Sistema");
			      if(Meteor.user().roles[0] == "produccion"){
				      $state.go('anon.produccion');
			      }else if(Meteor.user().roles[0] == "repartidor"){
				      $state.go('anon.repartidor');
			      }else{
				      $state.go('root.home');
			      }
			    }else{
					  toastr.error("Su usuario ya no está autorizado para entrar.");
				  }
				})
			}
		})
	}
}




/*
Meteor.apply('usuarioActivo', [this.credentials.username], function(error, result){
  if(result == true){
	  $meteor.loginWithPassword(rc.credentials.username, rc.credentials.password).then(
      function () {
	      toastr.success("Bienvenido al Sistema");
	      if(Meteor.user().roles[0] == "alumno"){
		      $state.go('root.alumnoMuro',{campus_id : Meteor.user().profile.campus_id});
	      }else{
		      $state.go('root.home');
	      }
        
      },
      function (error) {
	      if(error.reason == "Match failed"){
		      toastr.error("Escriba su usuario y contraseña para iniciar");
	      }else if(error.reason == "User not found"){
		      toastr.error("Usuario no encontrado");
	      }else if(error.reason == "Incorrect password"){
		      toastr.error("Contraseña incorrecta");
	      }        
      }
    )
  }else{
	  toastr.error("Su usuario ya no está autorizado para entrar.");
  }
  $scope.$apply();
});
*/