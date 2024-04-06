const express = require('express');
const ProveedorService = require('../servicios/ProveedorService');
const Pagination = require('../modelos/BO/Pagination');
const PaginationConstants = require('../constantes/PaginationConstants');
const Joi = require('joi');

const ProveedorRouter = express.Router();

ProveedorRouter.get('/:id', async (req, res) => {
    let id = req.params.id;
    let embed = req.query.embed || false;
    let proveedor = null;

    //Validación de datos...
    const schema = Joi.object({
        id: Joi.string().required().pattern(new RegExp("^[0-9a-fA-F]{24}$")),
        embed: Joi.boolean().optional()
    });
    const { error, value } = schema.validate({ id: id, embed: embed });
    if(error){
        return res.status(500).send({"status": "ERROR", "message": error.message});
    }
    id = value.id;
    embed = value.embed;

    try {
        proveedor = await ProveedorService.readById(id, embed);
    } catch (error) {
        //throw error; //crear una respuesta de errores
        return res.send(error);
    }

    if(!proveedor) res.status(204);
    
    res.send(proveedor);
});

ProveedorRouter.get('/', async (req, res) => {
    let paginacion = req.query.pagination;
    let filter = req.query.filter;
    let all = req.query.all;
    let embed = req.query.embed;
    let proveedores;

    //validación de datos
    const schema = Joi.object({
        embed: Joi.boolean().optional().default(false),
        all: Joi.boolean().optional().default(false),
        filter: Joi.object({
            keywords: Joi.string().optional().max(20).alphanum()
        }).optional(),
        pagination: Joi.object({
            sort: Joi.string().optional().max(15).default(PaginationConstants.DEFAULT_SORT),
            page: Joi.number().optional().min(0).integer().default(PaginationConstants.DEFAULT_PAGE),
            pageSize: Joi.number().optional().default(PaginationConstants.PAGE_SIZE)
        }).optional().default({
            sort: PaginationConstants.DEFAULT_SORT,
            page: PaginationConstants.DEFAULT_PAGE,
            pageSize: PaginationConstants.PAGE_SIZE
        })
    });
    const { error, value } = schema.validate({ embed: embed, all: all, filter: filter, pagination: paginacion });
    if(error){
        return res.status(500).send({"status": "ERROR", "message": error.message});
    }
    embed = value.embed;
    all = value.all;
    filter = value.filter;
    paginacion = value.pagination;

    try {
        if(all){
            proveedores = await ProveedorService.readAll(embed);
        }else{
            proveedores = await ProveedorService.readMany(paginacion, filter, embed); 
        }
    } catch (error) {
        return res.status(500).send({status: "ERROR", mensaje: error.message});
    }

    res.send(proveedores);
});

ProveedorRouter.post('/', async (req, res) => {
    let proveedor = req.body;
    let respuesta;
    
    //validacion de datos
    const schema = Joi.object({
        name: Joi.string().max(60).required(),
    });
    const { error, value } = schema.validate(proveedor);
    if(error){
        return res.status(500).send({"status": "ERROR", "message": error.message});
    }
    proveedor = value;

    try {
        respuesta = await ProveedorService.create(proveedor);    
    } catch (error) {
        return res.send(error);
    }

    res.send(respuesta);
});


/**
 * Elimina un proveedor, también el contrato ligado, si tiene uno.
 */
ProveedorRouter.delete('/:id', async (req, res) => {
    let id = req.params.id;
    let respuesta;

    //validacion de datos
    const schemaId = Joi.string().required().pattern(new RegExp("^[0-9a-fA-F]{24}$"));
    const schemaIdValidation = schemaId.validate(id);
    if(schemaIdValidation.error){
        return res.status(500).send({"status": "ERROR", "message": schemaIdValidation.error.message});
    }
    id = schemaIdValidation.value;

    try {
        respuesta = await ProveedorService.delete(id);
    } catch (error) {
        return res.send(error);
    }

    res.send(respuesta);
});

module.exports = ProveedorRouter;