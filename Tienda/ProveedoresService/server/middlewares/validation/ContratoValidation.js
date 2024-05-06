const { celebrate, Segments, Joi } = require('celebrate');
const Contrato = require('./schemas/Contrato');

const ContratoValidation = celebrate(
    {
        [Segments.BODY]: Contrato
    }
);

module.exports = ContratoValidation;