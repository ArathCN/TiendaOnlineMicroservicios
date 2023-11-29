import { Producto, Medidas } from "../DTO/Producto.js";

class ProductoMapper {
    static arrayMap(array) {
        let productos = array.map(function(element) {
            let medidas = new Medidas(
                element.alto,
                element.ancho,
                element.peso,
                element.udmd,
                element.udmp
            );
            let producto = new Producto(
                element.id,
                element.nombre,
                element.precio,
                element.cantidad,
                element.descripcion,
                element.categoria,
                element.imagen,
                medidas,
                element.proveedor
            );
            return producto;
        });

        return productos;
    }
}

export default ProductoMapper;