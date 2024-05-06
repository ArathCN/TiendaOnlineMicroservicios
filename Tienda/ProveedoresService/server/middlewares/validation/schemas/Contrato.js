const {Joi} = require('celebrate');
const SchemaType = require('./SchemaType');
const SchemaMapper = require('./SchemaMapper');

const Contrato = Joi.object({
    host: Joi.string().uri().lowercase().required(),
    path: Joi.string().uri({relativeOnly: true}).lowercase().required(),
    authentication: Joi.object().optional().default(null),
    endpoints: Joi.array().required().min(1).items(Joi.object().min(1).pattern(/.+/, Joi.object({
        path: Joi.string().lowercase().required(),
        pathVariables: Joi.array().optional().default(null).min(1).items(Joi.string().max(30).lowercase()),
        queryVariables: SchemaType.optional().default(null),
        body: SchemaType.optional().default(null),
        method: Joi.string().lowercase().required().valid("get", "post", "put", "patch", "delete", "head", "options"),
        responseType: Joi.object().optional().default(null).min(1).pattern(/[1-5]\d{2}/, SchemaType.required()),
        responseSchemaMapper: Joi.object().optional().default(null).min(1).pattern(/[1-5]\d{2}/, SchemaMapper.required()),

    })))
});

module.exports = Contrato;