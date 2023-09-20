const ClienteMongo = require('../modelos/BO/ClienteMongo');
const {ObjectId} = require('mongodb');

const cliente = ClienteMongo.getInstance();

const ContratoRepository = {
    "coleccion": cliente.db.collection("contratosProveedores"),

    "create": async (contrato) => {
        let query = {
            "host": contrato.host,
            "path": contrato.path,
            "authentication": contrato.authentication,
            "endpoints": contrato.endpoints
        };

        let respuesta = await ContratoRepository.coleccion.insertOne(query);

        return respuesta.insertedId;
    },

    "readById": async (id) => {
        let query = { "_id":  new ObjectId(id) };

        let contrato = await ContratoRepository.coleccion.findOne(query);

        return contrato;
    },

    "update": async (contrato) => {
        let query = {
          "_id": new ObjectId(contrato._id)
        };

        let update = {
            $set: {
                "host": contrato.host,
                "path": contrato.path,
                "authentication": contrato.authentication,
                "endpoints": contrato.endpoints
            }
        };

        let respuesta;

        try {
            respuesta = await ContratoRepository.coleccion.updateOne(query, update);
        } catch (error) {
            throw error;
        }

        return respuesta;
    }
}

module.exports = ContratoRepository;