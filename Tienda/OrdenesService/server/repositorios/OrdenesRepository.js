import ClienteMongo from '../modelos/BO/ClienteMongo.js';
import { ObjectId } from 'mongodb';
import PaginationConstants from '../constantes/PaginationConstants.js';
import OrdenState from '../../../common/OrdenState.mjs';

const cliente = ClienteMongo.getInstance();

/**
 * Clase que contiene las constantes de los nombres de los campos de Ordenes.
 */
class OrdenesFieldNames {
    static ID = "_id";
    static USUARIO = "usuario";
    static PRODUCTOS = "productos";
    static ENVIO = "envio";
    static PAGO = "pago";
    static EXPIRATION_DATE = "expirationDate";
    static CREATED_AT = "createdAt";
    static UPDATED_AT = "updatedAt";
    static ESTADO = "estado";
}

/**
 * orden = {
 *  _id
 *  idUsuario
 *  productos = [
 *      {
 *          idProducto,
 *          qty
 *      }
 *  ]
 *  idEnvio
 *  idPago
 *  expirarionDate
 *  createdAt
 *  updatedAt
 *  estado //
 * }
 */
class OrdenesRepository {
    static coleccion = cliente.db.collection("ordenes");

    static async create (orden) {
        let query = {
            "usuario": orden.usuario,
            "productos": orden.productos,
            "envio": null,
            "pago": null,
            "expirationDate": new Date(Date.now()),
            "createdAt": new Date(Date.now()),
            "updatedAt":new Date(Date.now()),
            "estado": OrdenState.CREATED
        };

        let respuesta = await OrdenesRepository.coleccion.insertOne(query);

        return respuesta.insertedId;
    }

    static async readById (id) {
        let query;

        try {
            query = { "_id":  new ObjectId(id) };
        } catch (error) {
            throw new Error(`ID '${id}' invalido.`);
        }
        

        let orden = await OrdenesRepository.coleccion.findOne(query);

        return orden;
    }

    static async readMany (pagination) {
        const sort = pagination.sort;
        const skip = PaginationConstants.PAGE_SIZE * pagination.page;
        const limit = PaginationConstants.PAGE_SIZE;
        let meta = [];

        let facet = `{"$facet": {"metadata": [{ "$group": { "_id": null, "total": { "$sum": 1 }}}], "data": [ { "$sort": {"${sort}": 1} },{ "$skip": ${skip} },{ "$limit": ${limit} }]}}`;
        let project1 = `{"$project": {"data": 1, "meta": {"total": {"$arrayElemAt": ["$metadata.total", 0]}}}}`;
        let addFields = `{"$addFields": {"meta.pageSize": ${limit}, "meta.page": ${pagination.page}}}`;
        let project2 = `{"$project": {"data": 1, "meta.total": 1, "meta.page": 1, "meta.pageSize": 1, "meta.pages": {"$round": [{"$divide": ["$meta.total", "$meta.pageSize"]}, 0]}}}`;
        

        facet = JSON.parse(facet);
        project1 = JSON.parse(project1);
        addFields = JSON.parse(addFields);
        project2 = JSON.parse(project2);

        meta.push(facet);
        meta.push(project1);
        meta.push(addFields);
        meta.push(project2);
        
        const cursor = OrdenesRepository.coleccion.aggregate(meta);
        
        let coleccion = await cursor.toArray();
        coleccion =  coleccion[0];
        
        return coleccion;
    }

    static async readManyByUser (usuario, pagination) {
      const sort = pagination.sort;
      const skip = PaginationConstants.PAGE_SIZE * pagination.page;
      const limit = PaginationConstants.PAGE_SIZE;
      let meta = [];

      let match = `{"$match": {"usuario": "${usuario}"}}`;
      let facet = `{"$facet": {"metadata": [{ "$group": { "_id": null, "total": { "$sum": 1 }}}], "data": [ { "$sort": {"${sort}": 1} },{ "$skip": ${skip} },{ "$limit": ${limit} }]}}`;
      let project1 = `{"$project": {"data": 1, "meta": {"total": {"$arrayElemAt": ["$metadata.total", 0]}}}}`;
      let addFields = `{"$addFields": {"meta.pageSize": ${limit}, "meta.page": ${pagination.page}}}`;
      let project2 = `{"$project": {"data": 1, "meta.total": 1, "meta.page": 1, "meta.pageSize": 1, "meta.pages": {"$round": [{"$divide": ["$meta.total", "$meta.pageSize"]}, 0]}}}`;
      
      match = JSON.parse(match);
      facet = JSON.parse(facet);
      project1 = JSON.parse(project1);
      addFields = JSON.parse(addFields);
      project2 = JSON.parse(project2);

      meta.push(match);
      meta.push(facet);
      meta.push(project1);
      meta.push(addFields);
      meta.push(project2);
      
      const cursor = OrdenesRepository.coleccion.aggregate(meta);
      
      let coleccion = await cursor.toArray();
      coleccion =  coleccion[0];
      
      return coleccion;
  }

    static async readPendingOrders (products) {
        let aggregation = [
            {
              '$match': { 'estado': { '$lt': OrdenState.PAID } }
            }, {
              '$project': {
                'productos': {
                  '$filter': {
                    'input': '$productos', 
                    'as': 'producto', 
                    'cond': { '$in': [ '$$producto.id', products ] }
                  }
                }
              }
            }, {
              '$match': {
                'productos': {
                  '$not': { '$size': 0 }
                }
              }
            }, {
              '$unwind': {
                'path': '$productos', 
                'includeArrayIndex': 'string'
              }
            }, {
              '$project': {
                'id': '$productos.id', 
                'qty': '$productos.qty'
              }
            }, {
              '$group': {
                '_id': '$id', 
                'qty': { '$sum': '$qty' }
              }
            }
        ];

        let cursor = await OrdenesRepository.coleccion.aggregate(aggregation);

        let ordenes = await cursor.toArray();

        return ordenes;
    }

    /**
     * Actualiza una entrada de Ordenes sólo con los campos especificados.
     * @param {string} id - El ID del objeto a actualizar.
     * @param {Object} camposAModificar - Objeto que contiene los campos y los valores nuevos a actualizar.
     * @param {Object} camposAEliminar - Objeto que contiene los campos que se eliminarán de la entrada.
     * @returns {Promise<Number>} El número de documentos actualizados, 0 o 1.
     */
    static async updateById (id, camposAModificar, camposAEliminar) {
        let query = { "_id":  new ObjectId(id) };
        let mod = new Object();

        if(camposAModificar && Object.keys(camposAModificar).length > 0) mod["$set"] = camposAModificar;
        if(camposAEliminar && Object.keys(camposAEliminar).length > 0) mod["$unset"] = camposAEliminar

        console.log(mod);
        let res = await OrdenesRepository.coleccion.updateOne(query, mod);

        return res.modifiedCount;
    }
}

export {OrdenesRepository, OrdenesFieldNames};