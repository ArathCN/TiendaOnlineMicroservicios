const express = require('express');
const ProductoService = require('../servicios/ProductoService');
const Pagination = require('../modelos/BO/Pagination');
const HttpError = require('../error/HttpError');

const router = express.Router();
const servicio = new ProductoService();

router.get('/:id', async (req, res) => {
    const {id} = req.params;
    let ids = id.split(",");
    let respuesta = null;
    
    try {
        let productos = await servicio.read(ids);
        if(productos.length == 0){
            res.status(204);
        }else if(productos.length == 1){
            productos = productos[0];
        }
        respuesta = productos;
    } catch (error) {
        respuesta = {"mensaje": error.name + ": " + error.message, "data": null};
        res.status(500);
    }
    
    res.send(respuesta);
});

router.get('/', async (req, res) => {
    const paginacion = req.query.pagination || new Pagination();
    const filtro = req.query.filter;
    let respuesta = null;
    let productos = null;

    try {
        productos = await servicio.readMany(paginacion, filtro);
    } catch (error) {
        res.status(500);
        respuesta = {"mensaje": error.name + ": " + error.message, "data": null};
    }
    
    //console.log(productos);

    res.send(productos);
});

router.patch('/get', async (req, res) => {
    let info = req.body;

    let respuesta;

    try {
        respuesta = await servicio.decrementarInventario(info);
    } catch (error) {
        if(error instanceof HttpError) {
            res.status(error.code);
            respuesta = {"mensaje": error.name + " : " + error.message, "data": error.data};
        }else{
            res.status(500);
            respuesta = {"mensaje": error.name + " => " + error.message, "data": null};
        }
        
    }

    console.log(req.originalUrl);
    res.send(respuesta);
});

router.patch('/set', async (req, res) => {
    let info = req.body;

    let respuesta;

    try {
        respuesta = await servicio.incrementarInventario(info);
    } catch (error) {
        respuesta = {"mensaje": error.name + ": " + error.message};
        res.status(500);
        
    }

    res.send(respuesta);
});

module.exports = router;