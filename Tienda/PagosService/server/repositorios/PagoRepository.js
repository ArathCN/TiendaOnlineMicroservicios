import ClienteMongo from '../common/ClienteMongo.js';
import { ObjectId } from 'mongodb';

const cliente = ClienteMongo.getInstance();

class PagoRepository {
    static coleccion = cliente.db.collection("pagos");

    /**
     * Crea una entrada de Pago en la Base de Datos.
     * @param {Object} pago - Objeto con las propiedades {orden, charge, transactionID, card}
     * @returns {Promise<String>} El ID autogenerado para la entrada creada.
     */
    static async create(pago){
        let query = {
            "orden": pago.orden,
            "charge": pago.charge,
            "transactionID": pago.transactionID,
            "card": pago.card,
            "createdAt": new Date(Date.now())
        };

        let respuesta = await PagoRepository.coleccion.insertOne(query);

        return respuesta.insertedId;
    }

    /**
     * Busca una entrada de Pago con el ID dado.
     * @param {String} id - El ID con el cual se buscará la entrada.
     * @returns {(Promise<Object>|null)} Retorna el objeto encontrado o null.
     */
    static async readById(id){
        let query;
        let pago = null;

        query = { "_id":  new ObjectId(id) };

        pago = await PagoRepository.coleccion.findOne(query);

        return pago;
    }
}

export default PagoRepository;