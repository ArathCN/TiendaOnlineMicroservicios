const ContratoRepository = require("../repositorios/ContratoRepository");

const ContratoService = {
    create: async (contrato) => {
        let respuesta;

        try {
            respuesta = await ContratoRepository.create(contrato);
        } catch (error) {
            throw error;
        }

        return respuesta;
    },

    readById: async (id) => {
        let contrato;
        try {
            contrato = await ContratoRepository.readById(id);
        } catch (error) {
            throw error;
        }

        return contrato;
    },

    update: async (id, operaciones) => {
        let respuesta;

        try {
            respuesta =  await ContratoRepository.update(id, operaciones);
        } catch (error) {
            throw error;
        }

        return respuesta;
    }
}

module.exports = ContratoRepository;