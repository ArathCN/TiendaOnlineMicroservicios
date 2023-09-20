const ContratoRepository = require("../repositorios/ContratoRepository");

const ContratoService = {
    create: async (contrato) => {
        let respuesta;

        try {
            respuesta = await ContratoService.create(contrato);
        } catch (error) {
            throw error;
        }

        return respuesta;
    },

    readById: async (id) => {
        let contrato;
        try {
            contrato = await ContratoService.readById(id);
        } catch (error) {
            throw error;
        }

        return contrato;
    },

    update: async (contrato) => {
        let respuesta;

        try {
            respuesta =  await ContratoService.update(contrato);
        } catch (error) {
            throw error;
        }

        return respuesta;
    }
}

module.exports = ContratoRepository;