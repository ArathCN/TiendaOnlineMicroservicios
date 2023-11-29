import ClienteMongo from '../common/ClienteMongo.js';
import { ObjectId, MongoServerError } from 'mongodb';

const cliente = ClienteMongo.getInstance();

class CuentaRepository {
    static coleccion = cliente.db.collection("cuentas");

    /**
     * Crear una Cuenta en la base de datos.
     * @param {Object} datos - Objeto que contiene los datos, {nombre, apellidoPaterno, apellidoMaterno}, para crear una Cuenta.
     * @returns {Promise<String>} Retorna el ID generado para la entrada creada en la base de datos.
     */
    static async create (datos) {
        let query = {
            "tarjeta": {
                "numero": datos.tarjeta.valid_card_number,
                "cvv": datos.tarjeta.cvv,
                "expiracion": new Date(datos.tarjeta.expiry_date),
                "emisor": datos.tarjeta.issuer,
                "marca": datos.tarjeta.card_brand
            },
            "balance": 0,
            "nombre": datos.nombre,
            "apellidoPaterno": datos.apellidoPaterno,
            "apellidoMaterno": datos.apellidoMaterno,
            "createdAt": new Date(Date.now())
        };

        let respuesta = await CuentaRepository.coleccion.insertOne(query);

        return respuesta.insertedId;
    }

    /**
     * Incrementa el balance de la cuenta especificada.
     * @param {String} id - ID de la cuenta a buscar.
     * @param {Number} balance - El incremento al balance de la cuenta.
     * @returns {Promise<Number>} El nuevo balance de la cuenta.
     */
    static async updateBalance (id, balance) {
        let query = { _id: new ObjectId(id) };
        let update = { $inc: { "balance": balance } };

        let response = await CuentaRepository.coleccion.findOneAndUpdate(query, update, {returnDocument: "after"});

        return response.balance;
    }

    /**
     * Buscar una cuenta en base a los datos de su tarjeta.
     * @param {Object} cardData - Datos de la tarjea usados para buscar una cuenta.
     * @returns {Promise<Objec>} Retorna la cuenta encontrada o null.
     */
    static async readByCard (cardData){
        let query = {"tarjeta.numero": cardData.tarjeta};
        let cuentaEncontrada = null;

        let cuenta = await CuentaRepository.coleccion.findOne(query);

        if(cuenta !== null){
            let vencimiento = new Date(cuenta.tarjeta.expiracion);
            const yyyy = vencimiento.getFullYear();
            let mm = vencimiento.getMonth() + 1; // month is zero-based
            if (mm < 10) mm = '0' + mm;
            const vencimientoFormateado = mm + '/' + yyyy;

            if(
                cardData.codigo == cuenta.tarjeta.cvv &&
                vencimientoFormateado == cardData.vencimiento &&
                cardData.nombre.toLowerCase() == cuenta.nombre.toLowerCase() &&
                cardData.apellidoPaterno.toLowerCase() == cuenta.apellidoPaterno.toLowerCase() &&
                cardData.apellidoMaterno.toLowerCase() == cuenta.apellidoMaterno.toLowerCase()
            ){
                cuentaEncontrada = cuenta;
            }
        }

        return cuentaEncontrada;
    }

    static async readById (id){
        let query = {"_id": new ObjectId(id)};

        let cuenta = await CuentaRepository.coleccion.findOne(query);

        return cuenta;
    }

    /**
     * Cobra un cargo a la cuenta origen y lo abona a la cuenta destino.
     * @param {String} origen - ID de la cuenta origen.
     * @param {String} destino - ID de la cuenta destino
     * @param {Number} cargo - El cargo a aplicar entre las cuentas.
     * @returns {Promise<Object>} Objeto {origen, destino} con el balance resultante de las cuentas o {error, mensaje} si la cuenta origen no tiene suficiente balance
     */
    static async updateBalanceTransaction (origen, destino, cargo) {
        const op = {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        }
        
        let balanceDec = {
            "query": { "_id": new ObjectId(origen) },
            "update": { "$inc": { "balance": -cargo } }
        };

        let balanceInc = {
            "query": { "_id": new ObjectId(destino) },
            "update": { "$inc": { "balance": cargo } }
        };

        
        let resultado = await cliente.cliente.withSession(async (session) =>
            session.withTransaction(async (session) => {
                
                let responseDec = null;
                try {
                    responseDec = await CuentaRepository.coleccion.findOneAndUpdate(balanceDec.query, balanceDec.update, {'session': session});
                } catch (error) {
                    await session.abortTransaction();
                    if (error instanceof MongoServerError && error.code === 121) {
                      return {error: true, "mensaje": "La cuenta origen no tiene suficiente balance."};
                    } else {
                      throw error;
                    }
                    
                }
                let responseInc = await CuentaRepository.coleccion.findOneAndUpdate(balanceInc.query, balanceInc.update, {'session': session});

                return {"origen": responseDec.balance, "destino": responseInc.balance};
            }, op)
        );

        return resultado;
    }

}

export default CuentaRepository;