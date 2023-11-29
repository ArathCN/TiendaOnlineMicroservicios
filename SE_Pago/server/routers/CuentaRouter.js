import { Router } from "express";
import CuentaService from "../servicios/CuentaService.js";

const CuentaRouter = Router();

/**
 * Consultar Cuenta por ID
 */
CuentaRouter.get('/:id', async (req, res) => {

});

/**
 * Consultar Cuenta por datos de tarjeta
 * 
 * {
 *      tarjeta: string,
 *      vencimiento: string,
 *      codigo: string,
 *      nombre: string,
 *      apellidoPaterno: string,
 *      apellidoMaterno: string
 * }
 */
CuentaRouter.post('/card', async (req, res) => {
    let cardData = req.body;
    let respuesta = null;

    try {
        let response = await CuentaService.FindByCard(cardData);
        respuesta = response;
    } catch (error) {
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    if(respuesta == null) res.status(204);

    res.send(respuesta);
});

/**
 * Crear cuenta
 * {
 *      nombre: string,
 *      apellidoPaterno: string,
 *      apellidoMaterno: string
 * }
 */
CuentaRouter.post('/', async (req, res) => {
    let datos = req.body;
    let respuesta = null;

    try {
        let response = await CuentaService.Create(datos);
        respuesta = {"estado": "OK", "data": response};
    } catch (error) {
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
})

/**
 * Sumar al balance de una cuenta especifica.
 */
CuentaRouter.patch('/balance/:id', async (req, res) => {
    let {id} = req.params;
    let inc = req.body;
    let respuesta = null;

    try {
        let response = await CuentaService.IncreaseDecreaseBalance(id, inc.incremento);
        respuesta = {"estado": "OK", "data": response};
    } catch (error) {
        res.status(500);
        respuesta = {"estado": "ERROR", "mensaje": error.message};
    }

    res.send(respuesta);
});

export default CuentaRouter;