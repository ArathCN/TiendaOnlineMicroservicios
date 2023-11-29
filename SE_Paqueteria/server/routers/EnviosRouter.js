import { Router } from "express";
import EnviosService from "../servicios/EnviosService.js";

const EnviosRouter = Router();

/**
 * Obtener una estimación del costo de envio...
 * Query
 * originAddress - Direccion origen
 * destinationAddress - Direccion destino
 */
EnviosRouter.get('/estimate', async (req, res) => {
    let {originAddress, destinationAddress} = req.query;
    let resp = null;

    console.log(originAddress);
    console.log(destinationAddress);
    console.log("\n\n")

    try {
        let respuesta = await EnviosService.Estimate(originAddress, destinationAddress);
        resp = respuesta;
    } catch (error) {
        res.status(500);
        console.log(error);
        resp = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(resp);
});

/**
 * Obtener un envio por si ID
 * Path
 * id - ID del envio
 */
EnviosRouter.get('/:id', async (req, res) => { 
    let {id} = req.params;
    let resp = null;

    try {
        let respuesta = await EnviosService.ReadById(id);
        if(!respuesta) res.status(204);
        else resp = respuesta;
    } catch (error) {
        res.status(500);
        resp = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(resp);
});

/**
 * Crear un envio...
 * Body
 * originAddress - Direccion origen
 * destinationAddress - Direccion destino
 */
EnviosRouter.post('/', async (req, res) => {
    let {originAddress, destinationAddress} = req.body;
    let resp = null;

    try {
        let respuesta = await EnviosService.Create(originAddress, destinationAddress);
        resp = respuesta;
    } catch (error) {
        res.status(500);
        resp = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(resp);
});

/**
 * Actualizar el estado de un envio...
 * Body
 * id - ID del envio a actualziar
 * state - Estado al que se quiere actualizar
 */
EnviosRouter.patch('/updateState', async (req, res) => {
    let {id, state} = req.body;
    let resp = null;

    try {
        let respuesta = await EnviosService.UpdateState(id, state);
        if(respuesta == 0){
            resp = {"estado": "ERROR", "mensaje": "No se ha actualizado el envio correctamente"};
        }else{
            resp = {"estado": "OK", "mensaje": "Se ha actualizado el envio correctamente"};
        }
    } catch (error) {
        res.status(500);
        resp = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(resp);
});


export default EnviosRouter;