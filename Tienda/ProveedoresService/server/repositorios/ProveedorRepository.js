const ClienteMongo = require('../modelos/BO/ClienteMongo');
const {ObjectId} = require('mongodb');
const PaginationConstants = require('../constantes/PaginationConstants');
const PaginationResponse = require('../modelos/BO/PaginationResponse');
const CollectionResponse = require('../modelos/BO/CollectionResponse');

const cliente = ClienteMongo.getInstance();

const ProveedorRepository = {
    "coleccion": cliente.db.collection("proveedores"),

    "create": async (proveedor) => {
        let query = {
            "name": proveedor.name,
            "contrato": null
        };

        let respuesta = await ProveedorRepository.coleccion.insertOne(query);

        return respuesta.insertedId;
    },

    "readById": async (id, embed) => {
        let query = { "_id":  new ObjectId(id) };
        let proveedor;

        if(embed){
            let match = {
                $match: {
                    "_id":  new ObjectId(id)
                }
            };

            let join = {
                $lookup: {
                    from: 'contratosProveedores',
                    localField: 'contrato',
                    foreignField: '_id',
                    as: 'contrato'
                }
            };

            let cursor = await ProveedorRepository.coleccion.aggregate([match, join]);
            proveedor = await cursor.toArray();
            proveedor = proveedor[0];
        }else{
            proveedor = await ProveedorRepository.coleccion.findOne(query);
        }

        return proveedor;
    },

    "readMany": async (pagination, filters, embed) => {
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

        if(embed){
            let lookup = {
                $lookup: {
                    from: 'contratosProveedores',
                    localField: 'contrato',
                    foreignField: '_id',
                    as: 'contrato'
                }
            }
            agg.unshift(lookup);
        }

        if (filters !== undefined) {
            const keywords = filters.keywords;
            let match = {"$match": {"$text": {"$search": keywords}}};
            console.log(match);
            agg.unshift(match);
        }
        
        const cursor = ProveedorRepository.coleccion.aggregate(agg);
        
        let coleccion;
        for await (const dato of cursor) {
            const pag = new PaginationResponse(dato.meta.total, dato.meta.pageSize, dato.meta.page, dato.meta.pages);
            coleccion = new CollectionResponse(dato.data, pag);
        }
        return coleccion;
    },

    "readAll": async (embed) =>  {
        let proveedores;
        let cursor;

        //Si se quiere encluir el documento de contrato
        if(embed){
            let join = {
                $lookup: {
                    from: 'contratosProveedores',
                    localField: 'contrato',
                    foreignField: '_id',
                    as: 'contrato'
                }
            };

            cursor = await ProveedorRepository.coleccion.aggregate([join]);
        }else{
            cursor = await ProveedorRepository.coleccion.find({});
        }

        proveedores = await cursor.toArray();

        return proveedores;
    },

    "delete": async (id) => {
        const session = cliente.cliente.startSession();
        let resultados = [];
        //let query = {"_id": new ObjectId(id)};

        try {
            await session.withTransaction(async () => {
                let proveedor = await ProveedorRepository.coleccion.findOne({"_id": new ObjectId(id)});
                let respuestaContrato = null;
                if(proveedor.contrato !== null) respuestaContrato = await cliente.db.collection("contratosProveedores").deleteOne({"_id": proveedor.contrato});
                let respuestaProveedor = await ProveedorRepository.coleccion.deleteOne({"_id": new ObjectId(proveedor._id)});

                resultados.push(respuestaProveedor, respuestaContrato);
            });
        } catch (error) {
            throw error;
        } finally{
            session.endSession();
        }

        return resultados;
    }
}

module.exports = ProveedorRepository;