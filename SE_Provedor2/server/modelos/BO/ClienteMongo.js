const { MongoClient, ServerApiVersion } = require("mongodb");

class ClienteMongo {
    constructor() {
        this.cliente = new MongoClient(process.env.DB_CONNECTION_STRING,  {
            serverApi: {
                version: ServerApiVersion.v1,
                //strict: true,
                deprecationErrors: true,
            }
        });
        //this.cliente.connect();
        this.db = this.cliente.db("SE_Proveedor2");

        this.crearIndexes();
    }

    async crearIndexes () {
        let textIndex_productos = {"name": "text", "category": "text", "description": "text"};
        let textIndex_opcions_productos = {"default_language": "es", "weights": {"name": 10, "category": 5}};

        const productos = this.db.collection("productos");

        const res = await productos.createIndex(textIndex_productos, textIndex_opcions_productos);
    }
}
class ClienteMongoSingleton {
    constructor() {
        throw new Error('Use ClienteMongoSingleton.getInstance()');
    }
    static getInstance() {
        if (!ClienteMongoSingleton.instance) {
            ClienteMongoSingleton.instance = new ClienteMongo();
        }
        return ClienteMongoSingleton.instance;
    }

    // static closeConection() {
    //     ClienteMongoSingleton.instance
    // }
}
module.exports = ClienteMongoSingleton;