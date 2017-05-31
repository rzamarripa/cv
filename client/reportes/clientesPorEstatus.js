angular
  .module('casserole')
  .controller('ClientesPorEstatusCtrl', ClientesPorEstatusCtrl);
 
function ClientesPorEstatusCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	this.fechaInicio = new Date();
	this.fechaInicio.setHours(0,0,0);
	this.fechaFin = new Date();
	this.fechaFin.setHours(23,59)
	this.semanaActual = moment(new Date()).isoWeek();
	this.diasActuales = [];
	this.alumnos = [];
	this.vendedores = [];
	
	window.rc = rc;
	
  this.getClientes = function(semana, anio){
	  Meteor.apply('getClientesPorEstatus', [this.fechaInicio, this.fechaFin, this.estatus, Meteor.user().profile.sucursal_id], function(error, result){
		  if(result){
			  console.log(result);
			  rc.clientes = result;
		    $scope.$apply();
		  }
	  });
  }
  
  this.getCantClientes = function(semana, anio){
	  Meteor.apply('getCantClientesPorEstatus', [this.fechaInicio, this.fechaFin, this.estatus, Meteor.user().profile.sucursal_id], function(error, result){
		  console.log(rc.fechaInicio, rc.fechaFin, rc.estatus, Meteor.user().profile.sucursal_id)
		  console.log(result);
		  $('#cantClientes').highcharts( {
			  chart: {
          type: 'column'
        },
        title: {
          text: 'Clientes por estatus por semana ',
          x: -20 //center
        },
        subtitle: {
          text: (rc.campus != undefined) ? rc.campus.nombre : '',
          x: -20
        },
        xAxis: {
          categories: result[0],
          plotBands: [{ // visualize the weekend
            from: 4.5,
            to: 6.5,
            color: 'rgba(68, 170, 213, .2)'
          }]
        },
        yAxis: {
          title: {
            text: 'Cantidad de Clientes'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        tooltip: {
          valueSuffix: ' Clientes'
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
          borderWidth: 0
        },
        plotOptions: {
          line: {
            dataLabels: {
              enabled: true
            },
            enableMouseTracking: true
          }
        },
        series: result[1]
	    });

	    $scope.$apply();
	  });
  }
};