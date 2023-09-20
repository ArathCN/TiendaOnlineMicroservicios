const express = require('express');
const ContratoService = require('../servicios/ContratoService');

const ContratoRouter = express.Router();

ContratoRouter.get('/:id', async (req, res) => {
    let id = req.params.id;
    let contrato = null;

    try {
        contrato = await ContratoService.readById(id);
    } catch (error) {
        //throw error; //crear una respuesta de errores
        return res.send(error);
    }
    
    res.send(contrato);
});

ContratoRouter.post('/', async (req, res) => {
    let contrato = req.body;
    let respuesta;

    try {
        respuesta = await ContratoService.create(contrato);    
    } catch (error) {
        return res.send(error);
    }

    res.send(respuesta);
});

ContratoRouter.patch('/:id', async (req, res) => {
    let id = req.params.id;
    let contrato = req.body;
    let respuesta;

    contrato._id = id;

    try {
        respuesta = await ContratoService.update(contrato);
    } catch (error) {
        return res.send(error);
    }

    res.send(respuesta);
});

module.exports = ContratoRouter;