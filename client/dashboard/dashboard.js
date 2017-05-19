angular
  .module('casserole')
  .controller('DashboardCtrl', DashboardCtrl);
 
function DashboardCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	this.fechaInicial = new Date();
	this.fechaInicial.setHours(0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,59,59);
  window.rc = rc;

	this.semanas = [];
	for(var i = 1; i <= 52; i++){
		this.semanas.push(i);
	}
	
	this.clientes_id = [];
	this.conceptos_id = [];	
	this.semanaActual = moment(new Date()).isoWeek();
	this.anio = moment().get('year');
	this.totalPagos = 0.00;
	this.categorias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
		
	this.subscribe('sucursales',()=>{
		return [{_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
	});
	
	this.subscribe('pagosPorSemana',()=>{
		var query = {sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", semanaPago : parseInt(this.getReactively("semanaActual")), estatus : 1, anioPago : parseInt(this.getReactively("anio"))};
		return [query]
	});
	
	this.subscribe('clientes', () => {		
		return [{"profile.estatus" : { $ne : 4}}]
	});

  this.helpers({
	  ventas : () => {
		  return Ventas.find({semana : parseInt(this.getReactively("semanaActual"))}).count();
	  },
	  sucursal : () => {
		  return Sucursales.findOne();
	  },
	  pagosPorSemana : () => {
			var pagos = Pagos.find().fetch();
		  var arreglo = {};
		  if(pagos){
			  
			  
			  arreglo = _.toArray(arreglo);
			  var valores = _.pluck(arreglo, "data");
			  var nombreGrupos = _.pluck(arreglo, "name");
			  rc.totalPagos = _.reduce(valores, function (memo, num) { return memo + num }, 0);

		  }
			$('#pagosPorGrupo').highcharts( {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Ingresos por colegiatura en la semana ' + rc.semanaActual
        },
        xAxis: {
            categories: nombreGrupos
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
            shared: true
        },
        plotOptions: {
            column: {
                stacking: ''
            }
        },
        series: [{
            name: 'Pagos',
            data: valores
        }]
    	});
		  return arreglo;
	  },
	  semanalesSemana : () => {
		  return Ventas.find({"planPagos.colegiatura.tipoColegiatura" : "Semanal", semana : parseInt(this.getReactively("semanaActual"))}).count();
	  },
	  mensualesSemana : () => {
		  return "";
	  },
	  cantidadClientesActivos : () => {
		  return "";
	  },
	  semanales : () => {
		  return "";
	  },
	  quincenales : () => {
		  return "";
	  },
	  mensuales : () => {
		  return "";
	  },
  });
}