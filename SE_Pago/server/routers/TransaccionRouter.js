import { Router } from "express";
import {TransaccionServiceCreateResponse, TransaccionService} from "../servicios/TransaccionService.js";
import TransaccionApiCodeStatus from "../../../common/constantes/TransaccionApiCodeStatus.mjs";

const TransaccionRouter = Router();

/**
 * Hacer una transacción
 * {
 *      origen: {
 *          tarjeta: string,
 *          vencimiento: string,
 *          codigo: string,
 *          nombre: string,
 *          apellidoPaterno: string,
 *          apellidoMaterno: string
 *      },
 *      destino: string,
 *      cargo: number
 * }
 */
TransaccionRouter.post('/', async (req, res) => {
    let transaccion = req.body;
    let respuesta = null;

    try {
        let response = await TransaccionService.Create(transaccion);
        if(response.codigo == TransaccionApiCodeStatus.OK){
            respuesta = {"estado": response.codigo, "data": response.datos};
        }else{
            respuesta = {"estado": response.codigo, "mensaje": response.mensaje};
        }
    } catch (error) {
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});

/**
 * Consultar una Transaccion por ID
 */
TransaccionRouter.get('/:id', async (req, res) => {
    let {id} = req.params;
    let respuesta = null;

    try {
        let response = await TransaccionService.ReadById(id);
        respuesta = response;
    } catch (error) {
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    if (respuesta == null) res.status(204);

    res.send(respuesta);
})

export default TransaccionRouter;