const {Joi} = require('celebrate');

const idSchema = Joi.string().required().pattern(new RegExp("^[0-9a-fA-F]{24}$"));

module.exports = {idSchema};