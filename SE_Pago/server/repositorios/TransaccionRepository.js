import ClienteMongo from '../common/ClienteMongo.js';
import { ObjectId } from 'mongodb';

const cliente = ClienteMongo.getInstance();

class TransaccionRepository {
    static coleccion = cliente.db.collection("transacciones");

    /**
     * Crea una entrada de Transaccion en la base de datos
     * @param {Object} transaccion - Objeto con las propiedades {origen, destino, cargo}
     * @returns {Promise<string>} Retorna el ID autogenerado para la entrada de Transaccion.
     */
    static async Create (transaccion){
        let query = {
            "origen": new ObjectId(transaccion.origen),
            "destino": new ObjectId(transaccion.destino),
            "cargo": transaccion.cargo,
            "createdAt": new Date(Date.now())
        };

        let respuesta = await TransaccionRepository.coleccion.insertOne(query);

        return respuesta.insertedId;
    }

    static async ReadById (id){
        let query = {"_id": new ObjectId(id)};

        let transaccion = await TransaccionRepository.coleccion.findOne(query);

        return transaccion;
    }
}

export default TransaccionRepository;