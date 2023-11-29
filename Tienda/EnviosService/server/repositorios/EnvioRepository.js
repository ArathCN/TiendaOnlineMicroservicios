import ClienteMongo from '../common/ClienteMongo.js';
import { ObjectId } from 'mongodb';

const cliente = ClienteMongo.getInstance();

/**
 * Envio
 * {
 *  _id: ObjectId,
 *  orden: string,
 *  createdAt: Date,
 *  to: Object
 * }
 * 
 * Dirección
 * {
 *  street: string,
 *  interiorNumer: string,
 *  zipCode: number,
 *  city: string,
 *  state: string,
 *  country: string
 * }
 */
class EnvioRepository {
    static coleccion = cliente.db.collection("envios");

    /**
     * Registra en Envio en la base de datos.
     * @param {Envio} envio - El objeto Envio a registrar en la base de datos.
     * @returns {Promise<string>} El ID generado para el registro.
     */
    static async create (envio) {
        let query = {
            "orden": envio.orden,
            "paqueteria": new ObjectId(envio.paqueteria),
            "createdAt": new Date(Date.now()),
            "to": envio.to,
            "cost": envio.cost,
            "updatedAt": new Date(Date.now())
        };

        let respuesta = await EnvioRepository.coleccion.insertOne(query);

        return respuesta.insertedId;
    }

    /**
     * Busca un registro de Envio con el ID dado.
     * @param {string} id - ID del Envio a consultar.
     * @param {boolean} embed - Boleano que indica si incluir los subenvios ligados al envio o no.
     * @returns {(Envio|null)} El envio encontrado para el ID o null si no se encontró ninguno.
     */
    static async readById (id, embed) {
        let query;
        let envio = null;

        try {
            query = { "_id":  new ObjectId(id) };
        } catch (error) {
            throw new Error(`ID '${id} invalido.'`);
        }

        if(embed){
            const agg = [
                {
                    '$match': query
                  }, {
                  '$lookup': {
                    'from': 'subenvios', 
                    'localField': '_id', 
                    'foreignField': 'envio', 
                    'as': 'subenvios'
                  }
                }, {
                  '$project': {
                    'subenvios.envio': 0
                  }
                }
            ];

            let cursor = await EnvioRepository.coleccion.aggregate(agg);
            envio = await cursor.toArray();
            envio = envio[0];
        }else{
            envio = await EnvioRepository.coleccion.findOne(query);
        }

        return envio;
    }

    /**
     * Actualiza una entrada de Ordenes sólo con los campos especificados.
     * @param {string} id - El ID del objeto a actualizar.
     * @param {Object} campos - Objeto que contiene los campos y los valores nuevos a actualizar.
     * @returns {Promise<Number>} El número de documentos actualizados, 0 o 1.
     */
    static async updateById (id, campos) {
        let query = { "_id":  new ObjectId(id) };
        let update = {"$set": campos};

        let res = await EnvioRepository.coleccion.updateOne(query, update);

        return res.modifiedCount;
    }
}

export default EnvioRepository;
