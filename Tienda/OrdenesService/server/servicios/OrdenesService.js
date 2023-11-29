import {OrdenesRepository, OrdenesFieldNames} from "../repositorios/OrdenesRepository.js";
import ProductosService from "./ProductosService.js";
import ProveedorService from "./ProveedorService.js";
import OrdenState from "../../../common/OrdenState.mjs";
import EnvioService from "./EnvioService.js";
import PagoService from "./PagoService.js";

/**
 * Clase que proporciona las opciones disponibles para adjuntar información embebida a una entrada de Orden.
 */
class OrdenesEmbedOptions {
    static ENVIO = "envio";
    static PAGO = "pago";
    static PROVEEDOR = "proveedor";
    static PRODUCTO = "producto";
}

class OrdenesService {

    /**
     * Retorna:
     * => String: El id generado de la orden.
     * => Array[{id, cantidad}]: Productos insuficientes para la orden
     */
    static async Create (order) {
        console.log("\n\n");
        //Primero comprobamos la disponibilidad de los productos con el servicio Productos
        //Retorna array de objetos (id, qty)
        let obj = order.productos.map((producto) => {
            let res = {"id": producto.id, "idProveedor": producto.idProveedor};
            return res;
        });
        let productosQty = await ProductosService.ReadByIds(obj);
        console.log(productosQty);

        //Comprobamos las ordenes pendientes
        //Retorna un array de objetos (_id, qty), que puede ser menor a la cantidad de productos a comprobar. De ser así es que no
        //hay ordenes pendientes para esos productos.
        let productsOrder = order.productos.map((producto) => {
            let res = producto.id;
            return res;
        });
        let pendingProductsOrders = await OrdenesRepository.readPendingOrders(productsOrder);

        //Agregamos a la lista de productos pendientes los productos que no se registearon con 0.
        productsOrder.forEach(product => {
            let id = pendingProductsOrders.findIndex((element) => element._id == product);
            if(id == -1) pendingProductsOrders.push({"_id": product, "qty": 0});
        });
        console.log("\nPending after:");
        console.log(pendingProductsOrders);

        //Restar a la cantidad actual el número de ordenes pendientes y verificar si hay insuficientes
        let insuficientes = [];
        productosQty.forEach(pq => {
            let productQtyPending = pendingProductsOrders.find((ppo) => ppo._id == pq._id);
            pq.qty -= productQtyPending.qty;
            if(pq.qty < 0) insuficientes.push(pq.id);
        });
        console.log("\nRemain:");
        console.log(productosQty);

        console.log("\nInsuficientes");
        console.log(insuficientes);
        if(insuficientes.length > 0) return insuficientes;

        //Actualizar el inventario
        await ProductosService.UpdateInventory(order.productos);

        //Crear orden
        let generatedId = await OrdenesRepository.create(order);

        return generatedId.toHexString();
    }

    /**
     * 
     * @param {string} id - ID de la Orden que se consultará.
     * @param {Array<String>} embed - Arreglo de cadenas que enlista qué información extra agregar a la Orden: envio, pago, proveedores o productos.
     * @returns {(Object|null)} La orden encontrada o null si no hubo ningun registro con el ID especificado.
     */
    static async ReadById (id, embed) {
        let orden = await OrdenesRepository.readById(id);

        if (!orden) return null;

        if(embed === undefined) return orden;

        for (const opcion of embed) {
            switch (opcion.toLowerCase()) {
                case OrdenesEmbedOptions.PROVEEDOR:
                    console.log("proveedor");
                    await OrdenesServiceHelper.SearchProveedores(orden);
                break;

                case OrdenesEmbedOptions.PRODUCTO:
                    console.log("producto");
                    await OrdenesServiceHelper.SearchProductos(orden);
                break;

                case OrdenesEmbedOptions.ENVIO:
                    console.log("envio");
                    await OrdenesServiceHelper.SearchEnvios(orden);
                break;

                case OrdenesEmbedOptions.PAGO:
                    console.log("pago");
                    await OrdenesServiceHelper.SearchPagos(orden);
                break;
            
                default:
                break;
            }
        }


        return orden;
    }

    static async ReadMany(pagination, embed) {
        let ordenes = await OrdenesRepository.readMany(pagination);

        return ordenes;
    }

    static async ReadManyByUser(user, pagination, embed) {
        let ordenes = await OrdenesRepository.readManyByUser(user, pagination);

        return ordenes;
    }

    /**
     * Método para actualizar el estado de una ordn, ya sea que se le vincule un envio, un pago, o se cambie el estado del envio de la orden.
     * @param {string} id - EL ID de la orden a actualizar.
     * @param {OrdenState} state - El estado al que se actualizará la orden.
     * @param {String} data - Es el ID o de los datos de envio o de los datos de pago, dependiendo del estado a actualizar.
     * 
     * @returns {Promise<Number>} 1 o 0, el número de documentos actualizados.
     */
    static async UpdateState(id, state, data) {
        let campos = new Object();
        let camposAEliminar = new Object();

        //campos[OrdenesFieldNames.EXPIRATION_DATE] = new Date(Date.now());
        campos[OrdenesFieldNames.UPDATED_AT] = new Date(Date.now());

        switch (state) {

            //Si es actualizar los datos de envio...
            case OrdenState.SHIPPING_INFO_SET:
                campos[OrdenesFieldNames.ENVIO] = data;
                campos[OrdenesFieldNames.ESTADO] = OrdenState.SHIPPING_INFO_SET;
                camposAEliminar[OrdenesFieldNames.EXPIRATION_DATE] = "";
            break;

            case OrdenState.PAID:
                campos[OrdenesFieldNames.PAGO] = data;
                campos[OrdenesFieldNames.ESTADO] = OrdenState.PAID;
            break;

            case OrdenState.SENDING:
                campos[OrdenesFieldNames.ESTADO] = OrdenState.SENDING;
            break;

            case OrdenState.DELIVERED:
                campos[OrdenesFieldNames.ESTADO] = OrdenState.DELIVERED;
            break;
        
            default:
                throw new Error("El estado dado no existe.");
            break;
        }

        let res = await OrdenesRepository.updateById(id, campos, camposAEliminar);

        return res;
    }

    /**
     * Crea una orden sin ninguna validación, SÓLO para pruebas
     * @param {*} order 
     */
    static async CreateSimple(order){
        let generatedId = await OrdenesRepository.create(order);

        return generatedId.toString();
    }
}

class OrdenesServiceHelper {
    
    static async SearchProveedores (order) {
        let proveedoresIDs = [];
        let proveedores = [];

        console.log(order);
        //Buscar todos los proveedores diferentes
        order.productos.forEach(producto => {
            let index = proveedoresIDs.findIndex(element => element == producto.idProveedor);
            if(index == -1) proveedoresIDs.push(producto.idProveedor);
        });

        //Consultar los proveedores
        for (const proveedorID of proveedoresIDs) {
            let proveedor = null;
            try {
                proveedor = await ProveedorService.ReadById(proveedorID);
            } catch (error) {
                if(error.response) throw new Error(error.response.data.mensaje);
                if(error.request) throw new Error("No es posible consultar al proveedor en este momento");
            }
            if(!proveedor) throw new Error(`No se encontró el proveedor con el ID ${proveedorID}`);
            proveedores.push(proveedor);
        }

        //Agregar a la orden los datos de proveedores.
        order.productos.forEach(producto => {
            for (let proveedor of proveedores) {
                console.log(producto.idProveedor + "==" + proveedor._id);
                if(producto.idProveedor == proveedor._id) {
                    delete producto.idProveedor;
                    producto.proveedor = Object.assign(new Object(), proveedor);
                    delete producto.proveedor.contrato;
                    producto.proveedor.id = producto.proveedor._id;
                    delete producto.proveedor._id;
                    break;
                }
            }
            
        });
        
    }

    static async SearchProductos (order) {
        let productosID = [];
        for (let producto of order.productos) {
            let proveedorID = producto.idProveedor || producto.proveedor.id;
            productosID.push({"id": producto.id, "idProveedor": proveedorID});
        }

        let productosDetails = await ProductosService.ReadByIds(productosID);

        for (let producto of order.productos) {
            producto.producto = productosDetails.find(element => element._id == producto.id)
            delete producto.id;
        }
    }

    static async SearchEnvios (order) {
        if(!order.envio) return;
        let envio = await EnvioService.ReadById(order.envio);
        
        if(envio == null) throw new Error("No se encontró el envio: " + order.envio);
        delete envio.orden;

        order.envio = envio;
    }

    static async SearchPagos (order) {
        if(!order.pago) return;
        let pago = await PagoService.ReadById(order.pago);
        
        if(pago == null) throw new Error("No se encontró el pago: " + order.pago);
        delete pago.orden;

        order.pago = pago;
    }
}

export default OrdenesService;