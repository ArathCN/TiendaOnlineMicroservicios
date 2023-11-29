import { Router } from "express";
import PagoService from "../servicios/PagoService.js";

const PagoRouter = Router();

PagoRouter.get('/:id', async (req, res) => {
    let {id} = req.params;
    let respuesta = null;

    try {
        let pago = await PagoService.ReadById(id);
        respuesta = pago;
    } catch (error) {
        res.status(500);
        respuesta = {"mensaje": error.message};
    }

    if(respuesta == null) res.status(204);

    res.send(respuesta);
});

/**
 * Pago
 * {
 *  orden: string,
 *  cargo: number,
 *  cliente: {
 *      {
 *          tarjeta: string,
 *          vencimiento: string,
 *          codigo: string,
 *          nombre: string,
 *          apellidoPaterno: string,
 *          apellidoMaterno: string
 *      }
 *  }
 * }
 */
PagoRouter.post('/', async (req, res) => {
    let pago = req.body;
    let respuesta = null;
    let usuario = req.headers["user"];

    try {
        respuesta = await PagoService.Create(usuario, pago);
    } catch (error) {
        res.status(500);
        console.log(error);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});

/**
 * SOLO PARA PRUEBAS
 * Crea una entrada de pago sin validaciones
 */
PagoRouter.post('/simple', async (req, res) => {
    let pago = req.body;
    let respuesta = null;

    try {
        respuesta = await PagoService.CreateSimple(pago);
    } catch (error) {
        res.status(500);
        console.log(error);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});

export default PagoRouter;