import { Router } from "express";
import PaqueteriaContratoService from "../servicios/PaqueteriaContratoService.js";

const PaqueteriaContratoRouter = Router();

/**
 * Obtener paquetería por ID
 * Path
 * id - Id de la paqueteria
 */
PaqueteriaContratoRouter.get('/:id', async (req, res) => {
    let id = req.params;
    let respuesta = null;

    try {
        let resp = await PaqueteriaContratoService.ReadById(id);
        respuesta = resp;
    } catch (error) {
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    if(!respuesta) res.status(204);

    res.send(respuesta);
});

/**
 * Crear contrato
 * Body
 * paqueteria - ID de la paqueteria a la que estará ligado el contrato
 * host
 * path
 * authentication
 * endpoints
 */
PaqueteriaContratoRouter.post('/', async (req, res) => {
    let contrato = req.body;
    let respuesta = null;
    let user = req.headers['user'];

    try {
        let resp = await PaqueteriaContratoService.Create(contrato.paqueteria, contrato);
        respuesta = resp;
    } catch (error) {
        res.status(500);
        console.log(error);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});

/**
 * Modificar un contrato
 * Path
 * id - id del contrato
 * 
 * Body
 * RFC 6902 
 */
PaqueteriaContratoRouter.patch('/:id', async (req, res) => {
    let operaciones = req.body;
    let id = req.params;
    let respuesta = null;

    

    try {
        let resp = await PaqueteriaContratoService.UpdateById(id, operaciones);
        respuesta = resp;
    } catch (error) {
        res.status(500);
        //console.log(error);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});


export default PaqueteriaContratoRouter;