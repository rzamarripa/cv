angular.module('casserole').service('Estatus', ['$meteor', function ($meteor) {
  this.getEstatusNombreColor = function(estatus){
	  var result = "";
	  if(estatus == 1){
		  result = "bg-color-blue txt-white";
	  }else if(estatus == 2){
		  result = "bg-color-purple txt-white"
	  }else if(estatus == 3){
		  result = "bg-color-greenLight txt-white"
	  }else if(estatus == 4){
		  result = "bg-color-red txt-white"
	  }else if(estatus == 5){
		  result = "bg-color-greenLight txt-white"
	  }
	  return result;
  }
  
  this.getEstatusNombre = function(estatus){
	  if(estatus == 1){
		  return "Registrado";
	  }else if(estatus == 2){
		  return "Activo";
	  }else if(estatus == 3){
		  return "Preferente";
	  }else if(estatus == 4){
		  return "Baja";
	  }
  }
  
  this.getEstatusNombreProceso = function(estatus){
	  if(estatus == 1){
		  return "Pendiente";
	  }else if(estatus == 2){
		  return "En Proceso";
	  }else if(estatus == 3){
		  return "Terminado";
	  }else if(estatus == 4){
		  return "Enviado";
	  }else if(estatus == 5){
		  return "Entregado";
	  }
  }
  
  this.getEstatusNombrePago = function(estatus){
	  if(estatus == 0){
		  return "Sin anticipo";
	  }else if(estatus == 1){
		  return "Abonado";
	  }else if(estatus == 2){
		  return "Pagado";
	  }else if(estatus == 3){
		  return "Cancelado";
	  }
  }
}]);


	