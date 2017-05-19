angular
.module("casserole")
.controller("ProspectosPorMedioPublicidadCtrl", ProspectosPorMedioPublicidadCtrl);
function ProspectosPorMedioPublicidadCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	this.nuevo = true;
	this.action = true;
  this.fechaInicial = new Date();
  this.fechaFinal = new Date();

  this.getProspectos = function(fechaInicial, fechaFinal){
    
    Meteor.apply('prospectosPorMediosPublicidad1', [fechaInicial, fechaFinal], function(error, result){
	    if(result){
		    console.log(result); 
	    }
      
      var nombres = _.pluck(result, "medio");
      var valores = _.pluck(result, "cantidad");
      
      var categorias = _.toArray(result[0])
      console.log(categorias)
      $('#prospectosPorMediosPublicidad').highcharts( {
          chart: {
                type: 'column'
            },
            title: {
                text: 'Clientes por Medios de Publicidad'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
	            title: {
		            text: 'Cantidad de Clientes'
		          },
              crosshair: false
            },
            yAxis: {
	            allowDecimals: false,
              min: 0,
              title: {
                  text: 'Cantidad de Clientes'
              }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: 	'<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    					'<td style="padding:0"><b>{point.y:.0f} p</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: result[1]
        });
        $scope.$apply();
    });
  }
};


