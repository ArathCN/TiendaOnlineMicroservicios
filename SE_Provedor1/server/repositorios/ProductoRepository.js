const ClienteMongo = require('../modelos/BO/ClienteMongo');
const { ObjectId, MongoServerError } = require('mongodb');
const PaginationConstants = require('../constantes/PaginationConstants');
const CollectionResponse = require('../modelos/BO/CollectionResponse');
const PaginationResponse = require('../modelos/BO/PaginationResponse');

class ProductoRepository {
    constructor () {
        this.cliente = ClienteMongo.getInstance();
        this.coleccion = this.cliente.db.collection("productos");
    }

    async readById (id) {
        let query = { "_id":  new ObjectId(id) };

        let producto = await this.coleccion.findOne(query);

        return producto;
    }

    async readMany (pagination, filters) {
        const sort = pagination.sort;
        const skip = PaginationConstants.PAGE_SIZE * pagination.page;
        const limit = PaginationConstants.PAGE_SIZE;

        let match = "";
        let facet = "";
        let project1 = "";
        let addFields = "";
        let project2 = "";

        let meta = [];
        if (filters !== undefined) {
            const keywords = filters.keywords;
            match = `{"$match": {"$text": {"$search": "${keywords}"}}}`;
            match = JSON.parse(match);
            meta.push(match);
        }

        facet = `{"$facet": {"metadata": [{ "$group": { "_id": null, "total": { "$sum": 1 }}}], "data": [ { "$sort": {"${sort}": 1} },{ "$skip": ${skip} },{ "$limit": ${limit} }]}}`;
        project1 = `{"$project": {"data": 1, "meta": {"total": {"$arrayElemAt": ["$metadata.total", 0]}}}}`;
        addFields = `{"$addFields": {"meta.pageSize": ${limit}, "meta.page": ${pagination.page}}}`;
        project2 = `{"$project": {"data": 1, "meta.total": 1, "meta.page": 1, "meta.pageSize": 1, "meta.pages": {"$round": [{"$divide": ["$meta.total", "$meta.pageSize"]}, 0]}}}`;
        

        facet = JSON.parse(facet);
        project1 = JSON.parse(project1);
        addFields = JSON.parse(addFields);
        project2 = JSON.parse(project2);

        meta.push(facet);
        meta.push(project1);
        meta.push(addFields);
        meta.push(project2);
        
        const cursor = this.coleccion.aggregate(meta);
        
        let coleccion;
        for await (const dato of cursor) {
            const pag = new PaginationResponse(dato.meta.total, dato.meta.pageSize, dato.meta.page, dato.meta.pages);
            coleccion = new CollectionResponse(dato.data, pag);
        }
        return coleccion;
    }

    async updateMany (productos) {
        const op = {
          readPreference: 'primary',
          readConcern: { level: 'local' },
          writeConcern: { w: 'majority' }
        }
        const session = this.cliente.cliente.startSession();
        let resultados = [];
        try {
          await session.withTransaction(async () => {
            const col = this.cliente.cliente.db('SE_Proveedor1').collection('productos');
            for (const producto of productos) {
              let query = { _id: new ObjectId(producto._id) };
              let update = { $inc: { qty: producto.qty } };
              let resultado = await col.updateOne(query, update, {'session': session});
              resultados.push(resultado);
            }
            
          }, op);
        } catch (error) {
          if (error instanceof MongoServerError && error.code === 121) {
            throw new Error("El producto con id '" + error.errInfo.failingDocumentId + "' ya no está disponible o se está ordenando más unidades de las disponibles.");
          } else {
            console.log(error);
            throw error;
          }
          //throw error;
        } finally{
          session.endSession();
        }

        return resultados;
    }

    async validation () {
        let val = {
            $jsonSchema: {
              required: [
                'name',
                'price',
                'qty',
                'category',
                'description',
                'measures',
                'image'
              ],
              properties: {
                name: {
                  bsonType: 'string',
                  maxLength: 100,
                  description: 'El campo \'name\' es requerido de tipo String no mayor a 200 caracteres'
                },
                price: {
                  bsonType: 'double',
                  minimum: 0.1,
                  description: 'El campo \'price\' es requerido de tipo double mayor a 0.1'
                },
                qty: {
                  bsonType: 'int',
                  minimum: 1,
                  description: 'El campo \'price\' es requerido de tipo int mayor igual a 1'
                },
                category: {
                  bsonType: 'string',
                  maxLength: 30,
                  description: 'El campo \'category\' es requerido de tipo String no mayor a 30 caracteres'
                },
                description: {
                  bsonType: 'string',
                  maxLength: 400,
                  description: 'El campo \'description\' es requerido de tipo String no mayor a 300 caracteres'
                },
                measures: {
                  bsonType: 'object',
                  required: [
                    'height',
                    'length',
                    'width',
                    'weight',
                    'uomd',
                    'uomw'
                  ],
                  properties: {
                    height: {
                      bsonType: 'double',
                      minimum: 0.1,
                      description: 'El campo \'measures.height\' es requerido de tipo double mayor a 0.1'
                    },
                    length: {
                      bsonType: 'double',
                      minimum: 0.1,
                      description: 'El campo \'measures.length\' es requerido de tipo double mayor a 0.1'
                    },
                    width: {
                      bsonType: 'double',
                      minimum: 0.1,
                      description: 'El campo \'measures.width\' es requerido de tipo double mayor a 0.1'
                    },
                    weight: {
                      bsonType: 'double',
                      minimum: 0.1,
                      description: 'El campo \'measures.weight\' es requerido de tipo double mayor a 0.1'
                    },
                    uomd: {
                      bsonType: 'string',
                      maxLength: 4,
                      description: 'El campo \'measures.uomd\' es requerido de tipo string maximo 4 caracteres'
                    },
                    uomw: {
                      bsonType: 'string',
                      maxLength: 4
                    }
                  }
                },
                image: {
                  bsonType: 'string'
                }
              }
            }
        };
    }
}

module.exports = ProductoRepository;