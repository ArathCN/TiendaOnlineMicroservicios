const ProductoRepository = require('../repositorios/ProductoRepository');
const Measures = require('../modelos/DTO/Measures');
const Producto = require('../modelos/DTO/Producto');
const HttpError = require('../error/HttpError');
//const Pagination = require('../modelos/BO/Pagination');

class ProductoService {
    constructor () {
        this.repository = new ProductoRepository();
    }

    async read (ids) {
        let productos = await this.repository.readById(ids);

        //Comprobar que todos los ids solicitados se encontraron
        let productosNoEncontrados = [];
        if(ids.length != productos.length){
            ids.forEach(id => {
                let encontrado = productos.findIndex((element) => element._id == id);
                if(encontrado == -1) productosNoEncontrados.push(id);
            });
        }

        if(productosNoEncontrados.length > 0) 
            throw new Error(`Los siguientes productos no se encontraron: ${productosNoEncontrados.join(", ")}`);

        return productos;
    }

    async readMany (pagination, filters) {
        let productos;
        
        if (filters === undefined) productos = await this.repository.readMany(pagination);
        else productos = await this.repository.readMany(pagination, filters);

        return productos;
    }

    async decrementarInventario(info) {
        //console.log(info);
        if(typeof info !== "object"){
            throw new HttpError("El cuerpo de la solicitud no es correcto.", 400);
        }

        info.forEach(element => {
            if(!element.hasOwnProperty("qty") || !element.hasOwnProperty("id")){
                throw new HttpError("El cuerpo de la solicitud no es correcto.", 400);
            }
        });

        let productos = info.map( item => { 
            return { _id: item.id , qty : (-1 * item.qty) }; 
        });

        

        let respuesta = await this.repository.updateManyTransaction(productos);

        if(respuesta.some(element => element.error == true))
            throw new HttpError("No se ha podido obtener los productos del proveedor", 500, respuesta);
        
        return respuesta;
    }

    async incrementarInventario(info) {
        if(typeof info !== "object"){
            throw new Error("El cuerpo de la solicitud no es correcto.");
        }

        info.forEach(element => {
            if(!element.hasOwnProperty("qty") || !element.hasOwnProperty("id")){
                throw new Error("El cuerpo de la solicitud no es correcto.");
            }
        });

        let productos = info.map( item => { 
            return { _id: item.id , qty : (item.qty) }; 
        });

        

        let respuesta = await this.repository.updateManyTransaction(productos);
        
        return respuesta;
    }

}

module.exports = ProductoService;