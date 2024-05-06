const {Joi} = require('celebrate');

const SchemaMapper = Joi.object({
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

module.exports = SchemaMapper;