import { Router } from 'express';
import PaqueteriaService from '../servicios/PaqueteriaService.js';

const PaqueteriaRouter = Router();

/**
 * Obtener todas las paqueterias
 */
PaqueteriaRouter.get('/', async (req, res) => {
    let id = req.params;
    let respuesta = null;

    try {
        let resp = await PaqueteriaService.ReadAll();
        respuesta = resp;
    } catch (error) {
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    if(!respuesta.length) res.status(204);

    res.send(respuesta);
});

/**
 * Estimar costo de envio
 * Query
 * orden
 * paqueteria
 * direccion
 */
PaqueteriaRouter.get('/estimate', async (req, res) => {
    let {orden, paqueteria, direccion} = req.query;
    let respuesta = null;
    let user = req.headers['user'] || "USR001";

    console.log(direccion);
    try {
        let resp = await PaqueteriaService.Estimate(user, orden, paqueteria, direccion);
        respuesta = resp;
    } catch (error) {
        res.status(500);
        console.log(error);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});

/**
 * Obtener paquetería por ID
 * Path
 * id - Id de la paqueteria
 */
PaqueteriaRouter.get('/:id', async (req, res) => {
    let id = req.params;
    let respuesta = null;

    try {
        let resp = await PaqueteriaService.ReadById(id);
        respuesta = resp;
    } catch (error) {
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    if(!respuesta) res.status(204);

    res.send(respuesta);
});

/**
 * Crear paqueteria
 * Body
 * name - nombre de la paqueteria
 */
PaqueteriaRouter.post('/', async (req, res) => {
    let paqueteria = req.body;
    let respuesta = null;
    let user = req.headers['user'];

    try {
        let resp = await PaqueteriaService.Create(paqueteria);
        respuesta = resp;
    } catch (error) {
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});



export default PaqueteriaRouter;