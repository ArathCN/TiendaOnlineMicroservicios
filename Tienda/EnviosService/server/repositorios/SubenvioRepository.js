import ClienteMongo from '../common/ClienteMongo.js';
import { ObjectId } from 'mongodb';
import { SubenvioState } from '../servicios/EnvioService.js';

const cliente = ClienteMongo.getInstance();

/**
 * Subenvio
 * {
 *  _id: ObjectId,
 *  envio: ObjectId,
 *  proveedor: String,
 *  from: Object,
 *  productos: Array
 *      {id: string, qty: number}
 *  "state": 1
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
class SubenvioRepository {
    static coleccion = cliente.db.collection("subenvios");

    /**
     * Registra un Subenvio en la base de datos.
     * @param {Subenvio} subenvio - El objeto Subenvio a registrar en la base de datos.
     * @returns {string} El ID generado para el registro.
     */
    static async create (subenvio) {
        let query = {
            "envio": new ObjectId(subenvio.envio),
            "proveedor": subenvio.proveedor,
            "from": subenvio.from,
            "productos": subenvio.productos,
            "state": SubenvioState.PREPARING_DELIVERY
        };

        let respuesta = await SubenvioRepository.coleccion.insertOne(query);

        return respuesta.insertedId;
    }

    /**
     * Inserta varios subenvios ligados a un unico Envio.
     * @param {Array<Subenvio>} subenvios - Array de Subenvio para insertar a la base de datos.
     * @returns {Promise<Array>} - Devuelve un array asociativo con los id generados automaticamente para los subenvios.
     */
    static async createManyTransaction (subenvios) {
        const op = {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        }
        let agg = [];
        subenvios.forEach(subenvio => {
            agg.push({
                "envio": new ObjectId(subenvio.envio),
                "proveedor": subenvio.proveedor,
                "from": subenvio.from,
                "productos": subenvio.productos,
                "state": SubenvioState.PREPARING_DELIVERY
            });
        });
        
        let resultado = await cliente.cliente.withSession(async (session) =>
            session.withTransaction(async (session) => {
                
                let response = await SubenvioRepository.coleccion.insertMany(agg, {'session': session});

                return response.insertedIds;
            }, op)
        );

        return resultado;
    }

    /**
     * 
     * @param {string} id - El ID del Subenvio a modificar.
     * @param {Object} fields - Objeto con las propiedades a modificar del Subnevio.
     */
    static async patchById (id, fields) {
        let query = { "_id":  new ObjectId(id) };
        let update = {"$set": fields};

        let res = await SubenvioRepository.coleccion.updateOne(query, update);

        return res.modifiedCount;
    }

    /**
     * Buscar un Envio en base al ID de un Subenvio perteneciente a él.
     * @param {String} id - ID del subenvio
     * @returns {Promise<Object>} El envio encontrado, {_id: ObjectId, subenvios: Array<{_id, state}>}
     */
    static async findEnvioById(id) {
      const agg = [
        {
          '$match': {
            'envio': new ObjectId(id)
          }
        }, {
          '$lookup': {
            'from': 'envios', 
            'localField': 'envio', 
            'foreignField': '_id', 
            'as': 'envio'
          }
        }, {
          '$project': {
            'state': 1, 
            'envio': {
              '$arrayElemAt': [
                '$envio', 0
              ]
            }
          }
        }, {
          '$project': {
            'state': 1, 
            'envio': '$envio._id', 
            'orden': '$envio.orden'
          }
        }, {
          '$group': {
            '_id': '$envio', 
            'subenvios': {
              '$push': {
                '_id': '$_id', 
                'state': '$state'
              }
            }, 
            'orden': {
              '$first': '$orden'
            }
          }
        }
      ];

      const cursor = SubenvioRepository.coleccion.aggregate(agg);
      const result = await cursor.toArray();

      console.log(result);
      return result;
    }

    static async findById(id) {
      let query = { "_id":  new ObjectId(id) };
      let envio = await SubenvioRepository.coleccion.findOne(query);

      return envio;
    }
}

export default SubenvioRepository;