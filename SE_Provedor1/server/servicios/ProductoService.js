const ProductoRepository = require('../repositorios/ProductoRepository');
const Measures = require('../modelos/DTO/Measures');
const Producto = require('../modelos/DTO/Producto');
//const Pagination = require('../modelos/BO/Pagination');

class ProductoService {
    constructor () {
        this.repository = new ProductoRepository();
    }

    async read (id) {
        let producto = await this.repository.readById(id);
        return producto;
    }

    async readMany (pagination, filters) {
        let productos;
        
        if (filters === undefined) productos = await this.repository.readMany(pagination);
        else productos = await this.repository.readMany(pagination, filters);

        return productos;
    }

    async actualizarInventario(info) {
        //console.log(info);
        if(typeof info !== "object"){
            throw new Error("El cuerpo de la solicitud no es correcto.");
        }

        info.forEach(element => {
            if(!element.hasOwnProperty("qty") || !element.hasOwnProperty("id")){
                throw new Error("El cuerpo de la solicitud no es correcto.");
            }
        });

        let productos = info.map( item => { 
            return { _id: item.id , qty : (-1 * item.qty) }; 
        });

        

        let respuesta;

        try {
            respuesta = await this.repository.updateMany(productos);
        } catch (error) {
            throw error;
        }
        
        return respuesta;
    }

}

module.exports = ProductoService;