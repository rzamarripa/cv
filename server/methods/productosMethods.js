Meteor.methods({
	validaProducto : function(productoActual){
		var result = "";
		var precio = 0.00, costo = 0.00;
		var producto = Productos.findOne(productoActual.producto_id);
		_.each(producto.detalleProducto, function(material){
			precio += material.precio;
			costo += material.costo;
		})
		if(parseFloat(precio) == parseFloat(productoActual.precio)){
			result = true;
		}else{
			
			_.each(producto.detalleProducto, function(material){
				if(material.id != undefined){
					console.log("material ", material)
					var materialActual = Materiales.findOne(material.id);
					precio += materialActual.precio;
					costo += materialActual.costo;
				}				
			});
			
			Productos.update({_id : producto._id},{ $set : {detalleProducto : producto.detalleProducto, precio : precio, costo : costo}});
		}		
		return result;
	}
});