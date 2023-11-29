import { MongoClient, ServerApiVersion } from "mongodb";

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
        this.db = this.cliente.db("TO_Proveedores");

        //this.crearIndexes();
    }

    async crearIndexes () {
        let ttlIndex_ordenes = { "expirationDate": 1 };
        let ttlIndex_opcions_ordenes = { "expireAfterSeconds": 300 };

        const ordenes = this.db.collection("ordenes");

        const res = await ordenes.createIndex(ttlIndex_ordenes, ttlIndex_opcions_ordenes);
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

export default ClienteMongoSingleton;