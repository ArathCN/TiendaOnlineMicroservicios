
class Medidas {
    constructor(alto, ancho, peso, udmd, udmp){
        this.alto = alto || 0;
        this.ancho = ancho || 0;
        this.peso = peso || 0;
        this.udmd = udmd || 0;
        this.udmp = udmp || 0;
    }
}

class Producto {
    constructor(id, nombre, precio, cantidad, descripcion, categoria, imagen, medidas, proveedor){
        this.id = id || 0;
        this.nombre = nombre || "";
        this.precio = precio || 0.0;
        this.cantidad = cantidad || 0;
        this.descripcion = descripcion || "";
        this.cantidad = categoria || "";
        this.imagen = imagen || "";
        this.medidas = medidas || new Medidas();
        this.proveedor = proveedor || 0;
    }

}

export {Medidas, Producto};