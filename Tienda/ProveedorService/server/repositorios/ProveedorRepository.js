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

        let match = "";
        let lookup = "";
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

        if(embed){
            lookup = {
                $lookup: {
                    from: 'contratosProveedores',
                    localField: 'contrato',
                    foreignField: '_id',
                    as: 'contrato'
                }
            }
            meta.push(lookup);
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
        
        const cursor = ProveedorRepository.coleccion.aggregate(meta);
        
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