import ClienteMongo from '../common/ClienteMongo.js';
import { ObjectId } from 'mongodb';

const cliente = await ClienteMongo.getInstance();

class PaqueteriaRepository {
    static coleccion = cliente.db.collection("paqueterias");

    static async Create (paqueteria) {
        let query = {
            "name": paqueteria.name,
            "contrato": null,
            "createdAt": new Date(Date.now())
        };

        let respuesta = await PaqueteriaRepository.coleccion.insertOne(query);

        return respuesta.insertedId;
    }

    static async Read () {
        let cursor = await PaqueteriaRepository.coleccion.find({});
        let paqueterias = await cursor.toArray();
        return paqueterias;
    }

    static async ReadById (id, embed) {
        const query = { "_id":  new ObjectId(id) };
        let paqueteria;

        if(embed){
            const match = {
                $match: {
                    "_id":  new ObjectId(id)
                }
            };

            const join = {
                $lookup: {
                    from: 'contratosPaqueterias',
                    localField: 'contrato',
                    foreignField: '_id',
                    as: 'contrato'
                }
            };

            let cursor = await PaqueteriaRepository.coleccion.aggregate([match, join]);
            paqueteria = await cursor.toArray();
            paqueteria = paqueteria[0];

            if(paqueteria.contrato.length){
                paqueteria.contrato = paqueteria.contrato[0];
            }else{
                paqueteria.contrato = null;
            }
        }else{
            paqueteria = await PaqueteriaRepository.coleccion.findOne(query);
        }

        return paqueteria;
    }

    static async UpdateById (id, campos){
        let query = { "_id":  new ObjectId(id) };
        if(campos.contrato) campos.contrato = new ObjectId(campos.contrato);
        let update = {"$set": campos};

        let res = await PaqueteriaRepository.coleccion.updateOne(query, update);

        return res.modifiedCount;
    }
}

export default PaqueteriaRepository;