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

    async readById (ids) {
        let idsArray = [];
        let productos = [];
        
        ids.forEach(id => {
          try {
            idsArray.push(new ObjectId(id));
          } catch (error) {
            throw new Error(`ID '${id}' invalido: ${error.message}`);
          }
        });
        let query = { "_id": {$in: idsArray}};

        let cursor = await this.coleccion.find(query);

        productos = await cursor.toArray();

        console.log(productos.length);
        return productos;
    }

    async readMany (pagination, filters) {
        const sort = pagination.sort;
        const skip = PaginationConstants.PAGE_SIZE * pagination.page;
        const limit = PaginationConstants.PAGE_SIZE;

        let agg = [
          {
            $facet: {
              metadata: [
                {
                  $group: {
                    _id: null,
                    total: { $sum: 1 }
                  }
                }
              ],
              data: [
                { $sort: { [sort]: 1 } },
                { $skip: skip },
                { $limit: limit }
              ]
            }
          },
          {
            $project: {
              data: 1,
              meta: {
                total: {
                  $arrayElemAt: ['$metadata.total', 0]
                },
                pageSize: { $size: '$data' },
                page: { $literal: pagination.page }
              }
            }
          },
          {
            $project: {
              data: 1,
              'meta.total': 1,
              'meta.page': 1,
              'meta.pageSize': 1,
              "meta.pages": {
                $subtract: [{$ceil: {
                    $divide: [
                      "$meta.total",
                      10,
                    ],
                  }}, 1],
              }
            }
          }
        ];

        if (filters !== undefined) {
          const keywords = filters.keywords;
          let match = {
            $match: {
              $text: {
                $search: keywords
              }
            }
          };
          agg.unshift(match);
      }
        
        const cursor = this.coleccion.aggregate(agg);
        
        let coleccion;
        for await (const dato of cursor) {
            const pag = new PaginationResponse(dato.meta.total, dato.meta.pageSize, dato.meta.page, dato.meta.pages);
            coleccion = new CollectionResponse(dato.data, pag);
        }
        return coleccion;
    }

    async updateOne (producto){
      let query = { _id: new ObjectId(producto._id) };
      let update = { $inc: { qty: producto.qty } };

      let resultado = await this.coleccion.updateOne(query, update, {'session': session});

      return resultado;
    }

    async updateManyTransaction (productos) {
      const op = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
      }

      let resultado = await this.cliente.cliente.withSession(async (session) =>
        session.withTransaction(async (session) => {
          let responses = [];
          const col = this.cliente.cliente.db('SE_Proveedor2').collection('productos');

          for (const producto of productos) {
            let query = { _id: new ObjectId(producto._id) };
            let update = { $inc: { qty: producto.qty } };
            let response = null;

            try {
              let _response = null;
              _response = await col.updateOne(query, update, {'session': session});
              response = {"id": producto._id, "mensaje": _response, "error": false};
              responses.push(response);
            } catch (error) {
              if (error instanceof MongoServerError && error.code === 121) {
                response = {"id": error.errInfo.failingDocumentId, "mensaje": "El producto ya no está disponible o se está ordenando más unidades de las disponibles.", error: true};
              } else {
                response = {"id": producto._id, "mensaje": error.message, "error": true};
              }
              responses = [];
              responses.push(response);
              await session.abortTransaction();
              break;
            }
          }

          return responses;
        }, op)
      );

      return resultado;
    }
}

module.exports = ProductoRepository;