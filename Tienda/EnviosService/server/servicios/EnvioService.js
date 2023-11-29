import EnvioRepository from "../repositorios/EnvioRepository.js";
import SubenvioRepository from "../repositorios/SubenvioRepository.js";
import OrdenService from "./OrdenService.js";
import EnvioStreamService from './EnvioStreamService.js';
import OrdenState from "../../../common/OrdenState.mjs";
import PaqueteriaService from "./PaqueteriaService.js";

class EnvioEmbedOptions {
    static DETAIL = "detail";
    static ORDEN = "orden";
}

class SubenvioFieldNames {
    static ID = "_id";
    static ENVIO = "envio";
    static PROVEEDOR = "proveedor";
    static FROM = "from";
    static PRODUCTOS = "productos";
    static STATE = "state";
    static UPDATED_AT = "updatedAt";
}

class SubenvioState {
    static PREPARING_DELIVERY = 1;
    static SENDING = 2;
    static DELIVERED = 3;
}

class EnvioService {

    /**
     * Crear una entrada de Envio en la base de datos con sus respectivos Subenvios.
     * @param {string} usuario - ID del usuario que realiza el envio.
     * @param {object} orden - Objeto con las propiedades {orden, direccion, paqueteria, costo}
     * @returns {Promise<Object>} Retorna un objeto {envio, subenvios}, que contiene los ID generados.
     */
    static async Create (usuario, envio) {
        let proveedores = [];

        //Consultar la orden.
        let orden = null;
        try {
            orden = await OrdenService.ReadById(envio.orden, ["proveedor"]);
        } catch (error) {
            if(error.response) throw new Error(error.response.data.mensaje);
        }
        if(!orden) throw new Error("No se encontró la orden del envio.");
        //if(orden.usuario != usuario) throw new Error("No se encontró la orden del usuario.");
        if(orden.estado != OrdenState.CREATED){
            throw new Error("No se puede crear un envio para la orden dada.");
        }

        //Extraer los subenvios a hacer en base a los productos ordenados
        //Se agrupan los productos por proveedor.
        orden.productos.forEach(producto => {
            if (proveedores[producto.proveedor.id] === undefined) {
                proveedores[producto.proveedor.id] = {
                    "name": producto.proveedor.name,
                    "address": producto.proveedor.address,
                    "productos": [{"id": producto.id, "qty": producto.qty}]
                };
            }else{
                proveedores[producto.proveedor.id].productos.push({"id": producto.id, "qty": producto.qty});
            }
        });

        //CONSULTAR CON EL ID DE LA PAQUETERIA EL COSTO
        let estimacion = await PaqueteriaService.EstimateInternal(proveedores, envio.paqueteria, envio.direccion);

        //Crear la entrada de Envio
        let _envio = {
            "orden": orden._id,
            "paqueteria": envio.paqueteria,
            "to": envio.direccion,
            "cost": estimacion.costo
        }
        let envioID = await EnvioRepository.create(_envio);

        //Crea un array de subenvios para crear las entradas
        let subenvios = [];
        for (const proveedorID in proveedores) {
            let subenvio = {
                "envio": envioID,
                "from": proveedores[proveedorID].address,
                "productos": proveedores[proveedorID].productos,
                "proveedor": proveedorID
            };
            subenvios.push(subenvio);
        }
        let _subenviosID = await SubenvioRepository.createManyTransaction(subenvios);
        let subenviosID = []
        for (const id in _subenviosID) {
            subenviosID.push(_subenviosID[id]);   
        }

        //avisar a Ordenes que se actualizó el estado...
        await EnvioStreamService.publish(envioID.toString(), orden._id.toString(), OrdenState.SHIPPING_INFO_SET.toString());


        //retornar resultados
        let response = {
            "envio": envioID,
            "subenvios": subenviosID
        }

        return response;
    }

    /**
     * Consultar un envio según su ID, se puede incluir la información relacionada a la entrada.
     * @param {String} id - ID del Envio a consultar.
     * @param {Array<String>} embed - Arreglo de propiedades acerca de la información extra a incluir en la entrada de Envio.
     * @returns {(Promise<Object>|null)} Retorna la entrada de Envio encontrada o null si no hubo ninguna.
     */
    static async ReadById(id, embed) {
        let envio = null;
        let orden = null;
        let productos = null;
        let detail = embed.findIndex(element => element.toLowerCase() == EnvioEmbedOptions.DETAIL);

        if (detail == -1) envio = await EnvioRepository.readById(id, false);
        else envio = await EnvioRepository.readById(id, true);

        if(envio == null) throw new Error(`El envio con el ID '${id}' no fue encontrado`);

        let siOrden = embed.findIndex(element => element.toLowerCase() == EnvioEmbedOptions.ORDEN);
        if(siOrden != -1) {
            try {
                orden = await OrdenService.ReadById(envio.orden, embed);
            } catch (error) {
                if(error.response){
                    throw new Error(error.response.data.mensaje);
                }
            }
            if(orden == null) throw new Error(`La orden con el ID '${envio.orden}' no fue encontrada`);
            envio.orden = orden;

            //Cambiar la información de orden.productos a subenvios[].productos
            let proveedores = []
            envio.orden.productos.forEach(producto => {
                let idProveedor = producto.idProveedor || producto.proveedor.id;
                if (proveedores[idProveedor] === undefined) {
                    proveedores[idProveedor] = {
                        "proveedor": producto.proveedor || producto.idProveedor,
                        "productos": [{"producto": producto.id || producto.producto, "qty": producto.qty}]
                    };
                }else{
                    proveedores[idProveedor].productos.push({"producto": producto.id || producto.producto, "qty": producto.qty});
                }
            });
            envio.subenvios.forEach(subenvio => {
                for (const proveedorID in proveedores) {
                    if(subenvio.proveedor == proveedorID){
                        subenvio.productos = proveedores[proveedorID].productos;
                        break;
                    }
                }
            });
            delete envio.orden.productos;
        }

        

        return envio;
    }

    /**
     * Método para actualizar el estado de un Subenvio y un Envio.
     * @param {string} id - EL ID de la orden a actualizar.
     * @param {OrdenState} state - El estado al que se actualizará la orden.
     * 
     * @returns {Promise<Number>} 1 o 0, el número de documentos actualizados.
     */
    static async UpdateState(id, state) {
        let campos = new Object();

        //Verificar que el estado sea correcto...
        for (const estado in SubenvioState) {
            if(state == SubenvioState[estado]){
                campos[SubenvioFieldNames.STATE] = state;
                break;
            }
        }
        if(campos[SubenvioFieldNames.STATE] === undefined) throw new Error("Estado no reconocido");

        //Consultar el subenvio y el envio...
        let subenvio = await SubenvioRepository.findById(id);
        if(!subenvio) throw new Error(`No se encontró un subenvio con el id '${id}'`);
        let envio = await EnvioRepository.readById(subenvio.envio, true);
        if(!envio) throw new Error(`No se encontró el envio asociado con el id '${subenvio.envio}'`);

        //verificar que la paqueteria correcta actualiza el estado del paquete correspondiente
        //si User typeof Paqueteria && envio.paqueteria == User.id

        //Consultar los subenvios asociados al envio, y la orden
        let orden = await OrdenService.ReadById(envio.orden, []);
        if(!orden) throw new Error(`No se encontró la orden '${envio.orden}'`);
        if(orden.estado <= OrdenState.SHIPPING_INFO_SET) throw new Error("No se puede actualizar la orden ligada al subenvio.");

        //Actualizar el subenvio...
        campos[SubenvioFieldNames.UPDATED_AT] = new Date(Date.now());
        let res = await SubenvioRepository.patchById(id, campos);
        let subenvioIndex = envio.subenvios.findIndex(se => se._id == id);
        envio.subenvios[subenvioIndex].state = state;

        let siEnviando = false;
        let siEnviado = true;
        envio.subenvios.forEach(subenvio => {
            if(subenvio.state == SubenvioState.SENDING) siEnviando = true;
            if(subenvio.state != SubenvioState.DELIVERED) siEnviado = false;
        });

        console.log("estado Orden: ", orden.estado);
        console.log("enviado: ", siEnviado);
        //Se avisa a Ordenes que se cambia el estado.
        if(orden.estado == OrdenState.PAID && siEnviando){
            await EnvioStreamService.publish(envio._id.toString(), orden._id, OrdenState.SENDING.toString());
        }else if(orden.estado == OrdenState.SENDING && siEnviado){
            await EnvioStreamService.publish(envio._id.toString(), orden._id, OrdenState.DELIVERED.toString());
        }

        return res;
    }
}

export {EnvioService, EnvioEmbedOptions, SubenvioState, SubenvioFieldNames};