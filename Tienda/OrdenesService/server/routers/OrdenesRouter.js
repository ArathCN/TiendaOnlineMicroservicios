import { Router } from 'express';
import OrdenesService from '../servicios/OrdenesService.js';
import Pagination from '../common/Pagination.js';

const OrdenesRouter = Router();

/**
 * Ver todas las ordenes, con paginacion
 */
OrdenesRouter.get('/', async (req, res) => {
    let paginacion = req.query.pagination || new Pagination();
    let {embed} = req.query;
    let respuesta = null;

    try {
        let productos = await OrdenesService.ReadMany(paginacion);
        respuesta = productos;
    } catch (error) {
        res.status(500);
        respuesta = {"mensaje": error.name + ": " + error.message};
    }

    res.send(respuesta);
});

/**
 * Ver todas las ordenes de un usuario especifico, con paginacion
 */
OrdenesRouter.get('/user', async (req, res) => {
    let paginacion = req.query.pagination || new Pagination();
    let {embed} = req.query;
    let respuesta = null;
    let usuario = req.headers['user'];

    try {
        let productos = await OrdenesService.ReadManyByUser(usuario, paginacion);
        respuesta = productos;
    } catch (error) {
        res.status(500);
        console.log(error);
        respuesta = {"mensaje": error.name + ": " + error.message};
    }

    res.send(respuesta);
});

/**
 * embed=producto,proveedor,envio,pago
 */
OrdenesRouter.get('/:id', async (req, res) => {
    let {id} = req.params;
    let embed = req.query.embed || "";
    let respuesta = null;

    embed = embed.split(",");
    try {
        let orden = await OrdenesService.ReadById(id, embed);
        respuesta = orden;
    } catch (error) {
        res.status(500);
        console.log(error);
        respuesta = {"mensaje": error.message};
    }

    if(respuesta == null) res.status(204);

    res.send(respuesta);
});

/**
 * Crear una orden
 * [
 *  {
 *      "id": "string",
 *      "idProveedor": "string",
 *      "qty": "number"
 *  },
 *  ...
 * ]
 */
OrdenesRouter.post('/', async (req, res) => {
    let productos = req.body;
    let respuesta = null;
    let usuarioID = req.headers['user'];

    let orden = {usuario: usuarioID, productos: productos};

    try {
        let orderResponse = await OrdenesService.Create(orden);
        if(typeof orderResponse === "string"){
            respuesta = {"estado": "OK", "data": orderResponse};
        }else if (Array.isArray(orderResponse)){
            respuesta = {"estado": "FAILED", "mensaje": "Algunos productos son insuficientes.", "data": orderResponse};
        }
    } catch (error) {
        res.status(500);
        console.log(error);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});

/**
 * Crea una orden sin validaciones y actualización de inventario, SÓLO para pruebas...
 */
OrdenesRouter.post('/simple', async (req, res) => {
    let orden = req.body;
    let respuesta = null;

    try {
        let orderResponse = await OrdenesService.CreateSimple(orden);
        respuesta = {"estado": "OK", "data": orderResponse};
    } catch (error) {
        res.status(500);
        console.log(error);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});

/**
 * SOLO PARA PRUEBAS...
 * Actualizar el estado de la orden
 * Es usada por los servicios de Envios y Pagos.
 * 
 * Recibe el objeto:
 * {
 *  "estado": string,
 *  "id": string,
 *  "data": string,
 * }
 * 
 * "estado" es un string valido.
 * "id" es un string con el ID de la orden a actualizar.
 * "data" es un string que contiene el ID de envios, pagos, o es null dependiendo del estado. 
 */
OrdenesRouter.patch('/updateState', async (req, res) => {
    let update = req.body;
    let respuesta = null;

    try {
        let updateResponse = await OrdenesService.UpdateState(update.id, update.estado, update.data);
        if(updateResponse == 1){
            respuesta = {"estado": "OK"};
        }else if (updateResponse == 0){
            respuesta = {"estado": "FAILED", "mensaje": "No se encontró una orden con el ID dado."};
        }
    } catch (error) {
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});


export default OrdenesRouter;

