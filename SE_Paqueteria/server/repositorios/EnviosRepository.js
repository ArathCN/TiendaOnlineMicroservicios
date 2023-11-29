import ClienteMongo from "../common/ClienteMongo.js";
import EnvioState from "../common/constantes/EnvioState.js";
import { ObjectId } from "mongodb";

const cliente = ClienteMongo.getInstance();

class EnviosRepository {
    static coleccion = cliente.db.collection("envios");

    static async create (envio) {

        const entry = {
            user: envio.user,
            origin: envio.origin,
            destination: envio.destination,
            cost: envio.cost,
            arrive: envio.arrive,
            state: EnvioState.WAITING_FOR_PACKAGE,
            updatedAt: new Date(Date.now()),
            createdAt: new Date(Date.now())
        }

        let respuesta = await EnviosRepository.coleccion.insertOne(entry);

        return respuesta.insertedId;
    }

    static async ReadById (id) {
        let query = { "_id":  new ObjectId(id) };
        let envio = await EnviosRepository.coleccion.findOne(query);
  
        return envio;
    }

    static async UpdateById (id, campos) {
        let query = { "_id":  new ObjectId(id) };
        let update = {"$set": campos};

        let res = await EnviosRepository.coleccion.updateOne(query, update);

        return res.modifiedCount;
    }

}

export default EnviosRepository;