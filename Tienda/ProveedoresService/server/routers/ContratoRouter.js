const express = require('express');
const ContratoService = require('../servicios/ContratoService');
const Joi = require('joi');
const jsonPatch = require('fast-json-patch');
const {idValidation, ContratoValidation} = require('../middlewares');

const ContratoRouter = express.Router();

/**
 * Obtener contrato por ID
 * id - numerico
 */
ContratoRouter.get('/:id', idValidation, async (req, res) => {
    let id = req.params.id;
    let contrato = null;

    try {
        contrato = await ContratoService.readById(id);
    } catch (error) {
        //throw error; //crear una respuesta de errores
        return res.status(500).send({"status": "ERROR", "message": error.message});
    }

    if(!contrato) res.status(204);
    
    res.send(contrato);
});

/**
 * Crear un contrato nuevo
 */
ContratoRouter.post('/', ContratoValidation, async (req, res) => {
    let contrato = req.body;
    let respuesta;

    try {
        respuesta = await ContratoService.create(contrato);    
    } catch (error) {
        return res.status(500).send({"status": "ERROR", "message": error.message});
    }

    res.send(respuesta);
});

/**
 * Actualizar contrato usando JSON PATCH
 */
ContratoRouter.patch('/:id', idValidation, async (req, res) => {
    let id = req.params.id;
    let operaciones = req.body;
    let respuesta;
    let contrato = null;

    //consultar contrato por el id
    try {
        contrato = await ContratoService.readById(id);
    } catch (error) {
        return res.status(500).send({"status": "ERROR", "message": error.message});
    }
    if(!contrato) return res.status(500).send({"status": "ERROR", "message": "Contrato no encontrado"});
    //console.log(contrato);

    //validar si las operaciones PATCH son correctas
    //console.log(operaciones);
    let errores = jsonPatch.validate(operaciones, contrato);
    if(errores){
        return res.status(500).send({"status": "ERROR", "message": errores.message});
    }

    //aplicar operaciones
    jsonPatch.applyPatch(contrato, operaciones);

    //Validacion del esquema de contrato modificado
    const schemaDataDescription = Joi.object({
        type: Joi.string().max(20).lowercase().valid("string", "number", "object", "array").required(),
        opcional: Joi.boolean().optional(),
        properties: Joi.when('type', {
            is: 'object',
            then: Joi.object().min(1).required().pattern(/.+/, Joi.link('...').required())
        }),
        elements: Joi.when('type', {
            is: 'array',
            then: Joi.link('..').required()
        })
    });
    const schemaDataMapper = Joi.object({
        type: Joi.string().max(20).lowercase().valid("string", "number", "object", "array").optional(),
        source: Joi.when('type', {
            is: Joi.string().required().valid('object', 'array'),
            then: Joi.string().optional(),
            otherwise: Joi.string().required()

        }),
        properties: Joi.when('type', {
            is: 'object',
            then: Joi.object().min(1).required().pattern(/.+/, Joi.link('...').required())
        }),
        elements: Joi.when('type', {
            is: 'array',
            then: Joi.link('..').required()
        })
    });
    const schema = Joi.object({
        _id: Joi.any(),
        host: Joi.string().uri().lowercase().required(),
        path: Joi.string().uri({relativeOnly: true}).lowercase().required(),
        authentication: Joi.object().optional().default(null).allow(null),
        endpoints: Joi.array().required().min(1).items(Joi.object().pattern(/.+/, Joi.object({
            path: Joi.string().lowercase().required(),
            pathVariables: Joi.array().optional().allow(null).default(null).min(1).items(Joi.string().max(30).lowercase()),
            queryVariables: schemaDataDescription.optional().default(null).allow(null),
            body: schemaDataDescription.optional().default(null).allow(null),
            method: Joi.string().lowercase().required().valid("get", "post", "put", "patch", "delete", "head", "options"),
            responseType: Joi.object().optional().default(null).allow(null).min(1).pattern(/[1-5]\d{2}/, schemaDataDescription.required()),
            responseSchemaMapper: Joi.object().optional().default(null).allow(null).min(1).pattern(/[1-5]\d{2}/, schemaDataMapper.required()),

        })))
    });
    const schemaValidation = schema.validate(contrato);
    if(schemaValidation.error){
        return res.status(500).send({status: "ERROR", message: "Validación => " + schemaValidation.error.message})
    }
    contrato = schemaValidation.value;

    try {
        respuesta = await ContratoService.update(id, operaciones);
    } catch (error) {
        return res.send(error);
    }

    res.send(respuesta);
});

ContratoRouter.post('/schema', async (req, res) => {
    let contrato = req.body;

    //Validacion de datos
    const schemaDataDescription = Joi.object({
        type: Joi.string().max(20).lowercase().valid("string", "number", "object", "array").required(),
        opcional: Joi.boolean().optional(),
        properties: Joi.when('type', {
            is: 'object',
            then: Joi.object().min(1).required().pattern(/.+/, Joi.link('...').required())
        }),
        elements: Joi.when('type', {
            is: 'array',
            then: Joi.link('..').required()
        })
    });
    const schemaDataMapper = Joi.object({
        type: Joi.string().max(20).lowercase().valid("string", "number", "object", "array").optional(),
        source: Joi.when('type', {
            is: Joi.string().required().valid('object', 'array'),
            then: Joi.string().optional(),
            otherwise: Joi.string().required()

        }),
        properties: Joi.when('type', {
            is: 'object',
            then: Joi.object().min(1).required().pattern(/.+/, Joi.link('...').required())
        }),
        elements: Joi.when('type', {
            is: 'array',
            then: Joi.link('..').required()
        })
    });
    const schema = Joi.object({
        host: Joi.string().uri().lowercase().required(),
        path: Joi.string().uri({relativeOnly: true}).lowercase().required(),
        authentication: Joi.object().optional().default(null),
        endpoints: Joi.array().required().min(1).items(Joi.object().pattern(/.+/, Joi.object({
            path: Joi.string().lowercase().required(),
            pathVariables: Joi.array().optional().default(null).min(1).items(Joi.string().max(30).lowercase()),
            queryVariables: schemaDataDescription.optional().default(null),
            body: schemaDataDescription.optional().default(null),
            method: Joi.string().lowercase().required().valid("get", "post", "put", "patch", "delete", "head", "options"),
            responseType: Joi.object().optional().default(null).min(1).pattern(/[1-5]\d{2}/, schemaDataDescription.required()),
            responseSchemaMapper: Joi.object().optional().default(null).min(1).pattern(/[1-5]\d{2}/, schemaDataMapper.required()),

        })))
    });

    const schemaValidation = schema.validate(contrato);
    if(schemaValidation.error){
        return res.status(500).send({status: "ERROR", message: schemaValidation.error.message})
    }
    contrato = schemaValidation.value;

    res.send(contrato);
});

module.exports = ContratoRouter;