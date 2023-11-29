const express = require('express');
const ProveedorService = require('../servicios/ProveedorService');
const Pagination = require('../modelos/BO/Pagination');

const ProveedorRouter = express.Router();

ProveedorRouter.get('/:id', async (req, res) => {
    let id = req.params.id;
    let embed = req.query.embed || false;
    let proveedor = null;

    try {
        proveedor = await ProveedorService.readById(id, embed);
    } catch (error) {
        //throw error; //crear una respuesta de errores
        return res.send(error);
    }
    
    res.send(proveedor);
});

ProveedorRouter.get('/', async (req, res) => {
    const paginacion = req.query.pagination || new Pagination();
    const filtro = req.query.filter;
    const all = req.query.all;
    const embed = req.query.embed;
    let proveedores;

    if(all){
        try {
            proveedores = await ProveedorService.readAll(embed);
        } catch (error) {
            return res.send(error);
        }
    }else{
        try {
            proveedores = await ProveedorService.readMany(paginacion, filtro, embed);
        } catch (error) {
            return res.send(error);
        }
    }

    res.send(proveedores);
});

ProveedorRouter.post('/', async (req, res) => {
    let proveedor = req.body;
    let respuesta;

    try {
        respuesta = await ProveedorService.create(proveedor);    
    } catch (error) {
        return res.send(error);
    }

    res.send(respuesta);
});

ProveedorRouter.patch('/:id', async (req, res) => {
    let id = req.params.id;
    let proveedor = req.body;
    let respuesta;

    proveedor._id = id;

    try {
        respuesta = await ProveedorService.update(proveedor);
    } catch (error) {
        return res.send(error);
    }

    res.send(respuesta);
});

ProveedorRouter.delete('/:id', async (req, res) => {
    let id = req.params.id;
    let respuesta;

    try {
        respuesta = await ProveedorService.delete(id);
    } catch (error) {
        return res.send(error);
    }

    res.send(respuesta);
});

module.exports = ProveedorRouter;