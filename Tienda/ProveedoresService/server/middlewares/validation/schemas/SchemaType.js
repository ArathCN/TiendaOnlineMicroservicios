const {Joi} = require('celebrate');

const SchemaType = Joi.object({
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

module.exports = SchemaType;