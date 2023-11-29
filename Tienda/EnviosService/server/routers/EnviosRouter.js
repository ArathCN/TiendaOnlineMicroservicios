import { Router } from 'express';
import {EnvioService} from '../servicios/EnvioService.js';

const EnviosRouter = Router();

/**
 * Consultar Envio por ID.
 * embed: string
 */
EnviosRouter.get('/:id', async (req, res) => {
    let {id} = req.params;
    let embed = req.query.embed || "";
    let respuesta = null;

    embed = embed.split(",");

    try {
        let orden = await EnvioService.ReadById(id, embed);
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
 * Crear un envio.
 * {
 *      "orden": "string",
 *      "direccion": "object",
 *      "paqueteria": "string"
 *  }
 * 
 * Dirección
 * {
 *      street: string,
 *      interiorNumer: string,
 *      zipCode: number,
 *      city: string,
 *      state: string,
 *      country: string
 * }
 */
EnviosRouter.post('/', async (req, res) => {
    let envio = req.body;
    let respuesta = null;
    let user = req.headers['user'];

    try {
        respuesta = await EnvioService.Create(user, envio);
    } catch (error) {
        console.log(error);
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});

/**
 * Actualizar el estado de un subenvio.
 * Es usada por los servicios externos de paqueterias.
 * 
 * Recibe el objeto:
 * {
 *  "estado": string
 * }
 */
EnviosRouter.patch('/updateState/:id', async (req, res) => {
    let {id} = req.params;
    let update = req.body;
    let respuesta = null;

    try {
        let updateResponse = await EnvioService.UpdateState(id, update.estado);
        if(updateResponse == 1){
            respuesta = {"estado": "OK"};
        }else if (updateResponse == 0){
            respuesta = {"estado": "FAILED", "mensaje": "No se encontró un subenvio con el ID dado."};
        }
    } catch (error) {
        res.status(500);
        console.log(error.message);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});


export default EnviosRouter;
