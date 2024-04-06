const ClienteMongo = require('../modelos/BO/ClienteMongo');
const {ObjectId} = require('mongodb');
const { updatesForPatch } = require('rfc6902-mongodb');

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

    "update": async (id, operaciones) => {

        let query = {
            "_id": new ObjectId(id)
        };

        let contrato = await ContratoRepository.readById(id);
        if(!contrato) throw new Error("Contrato no encontrado");

        const updates = updatesForPatch(operaciones, contrato);
        console.log(updates[0]);

        let res = await ContratoRepository.coleccion.updateOne(query, updates[0]);

        
        return res;
    }
}

module.exports = ContratoRepository;