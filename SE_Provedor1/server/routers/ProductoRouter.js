const express = require('express');
const ProductoService = require('../servicios/ProductoService');
const Pagination = require('../modelos/BO/Pagination');

const router = express.Router();
const servicio = new ProductoService();

router.get('/:id', async (req, res) => {
    const {id} = req.params;
    let producto = await servicio.read(id);
    console.log(producto);
    res.send(producto);
});

router.get('/', async (req, res) => {
    const paginacion = req.query.pagination || new Pagination();
    const filtro = req.query.filter;

    let productos = await servicio.readMany(paginacion, filtro);
    
    //console.log(productos);

    res.send(productos);
});

router.post('/actualizarInventario', async (req, res) => {
    let info = req.body;
    
    let respuesta;

    try {
        respuesta = await servicio.actualizarInventario(info);
    } catch (error) {
        respuesta = error.name + ": " + error.message;
    }

    res.send(respuesta);
});

module.exports = router;