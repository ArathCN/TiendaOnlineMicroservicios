import ClienteMongo from '../common/ClienteMongo.js';
import { ObjectId } from 'mongodb';
import { updatesForPatch } from 'rfc6902-mongodb';

const cliente = await ClienteMongo.getInstance();

class PaqueteriaContratoFieldNames {
    static ID = "_id";
    static HOST = "host";
    static PATH = "path";
    static AUTHENTICATION = "authentication";
    static ENDPOINTS = "endpoints";
}

class PaqueteriaContratoRepository {
    static coleccion = cliente.db.collection("contratosPaqueterias");

    static async Create (contrato) {
        let query = {
            "host": contrato.host,
            "path": contrato.path,
            "authentication": contrato.authentication,
            "endpoints": contrato.endpoints
        };

        let respuesta = await PaqueteriaContratoRepository.coleccion.insertOne(query);

        return respuesta.insertedId;
    }

    static async ReadById (id) {
        const query = { "_id":  new ObjectId(id) };
        const res = await PaqueteriaContratoRepository.coleccion.findOne(query);

        return res;
    }

    static async UpdateById (id, operaciones) {
        let query = {
          "_id": new ObjectId(id)
        };

        let contrato = await PaqueteriaContratoRepository.ReadById(id);
        if(!contrato) throw new Error("Contrato no encontrado");

        const updates = updatesForPatch(operaciones, contrato);
        console.log(updates[0]);

        let res = await PaqueteriaContratoRepository.coleccion.updateOne(query, updates[0]);

        
        return res;
    }
}

export {PaqueteriaContratoRepository, PaqueteriaContratoFieldNames};