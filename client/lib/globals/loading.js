window.loading = function(val, milisec){
	if(!milisec){
		milisec = 300;
	}
  if(val){
    if(!window.loadingInterval){
    	$("[type=button]").attr("disabled", true);
    	$("body").css("cursor", "progress");
      window.loadingInterval = setInterval(function(){NProgress.inc()}, milisec);
    }
  }else{
    clearInterval(window.loadingInterval);
    delete window.loadingInterval;
    $("[type=button]").attr("disabled", false);
    $("body").css("cursor", "default");
    NProgress.done();
  }
};

window.downloadFile = function(params) {
  if(!params || !params.uri || !params.nombre){
    console.log('err');
  }else{
    var link = document.createElement("a");
    link.download = params.nombre;
    link.href = params.uri;
    link.click();
  }
}