const { celebrate, Segments, Joi } = require('celebrate');
const { idSchema } = require('./schemas/values');

const idValidation = celebrate(
    {
        [Segments.PARAMS]: Joi.object().keys({
            id: idSchema
        }).unknown(),
    }
);

module.exports = idValidation;