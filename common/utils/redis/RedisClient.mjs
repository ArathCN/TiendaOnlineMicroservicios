import { createClient } from 'redis';

class RedisClient {

    constructor(URL) {
        this.connectionURL = URL;
        this.cliente = null;
    }

    async getConnection() {
        if (!this.cliente && this.connectionURL) {
            this.cliente = createClient({"url": this.connectionURL});
      
            this.cliente.on('error', (err) => {
                console.log('Redis Client Error', err);
            });
      
            await this.cliente.connect();
            console.log("Conectado a Redis exitosamente.");
        }

        return this.cliente;
    }

    async closeConnection() {
        if (this.cliente) {
          await this.cliente.disconnect();
        }
    }
}

class RedisClientSingleton {
    constructor() {
        throw new Error('Use RedisClientSingleton.getInstance()');
    }
    static async getInstance() {
        if (!RedisClientSingleton.instance) {
            RedisClientSingleton.instance = new RedisClient();
        }
        return RedisClientSingleton.instance.getConnection();
    }
}

export default RedisClientSingleton;