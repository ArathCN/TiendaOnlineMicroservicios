import { createClient, commandOptions } from 'redis';

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

        console.log("Cliente Redis desconectado");
    }
}

class RedisClientSingleton {
    static instance = null;

    constructor() {
        throw new Error('Use RedisClientSingleton.getInstance()');
    }
    static async getInstance() {
        if (RedisClientSingleton.instance) {
            return await RedisClientSingleton.instance.getConnection();
        }else{
            throw new Error("Inicia primero Redis");
        }
    }

    static async setRedis(url) {
        RedisClientSingleton.instance = new RedisClient(url);
        await RedisClientSingleton.instance.getConnection();
    }
    
    static async closeRedis() {
        if(RedisClientSingleton.instance){
            await RedisClientSingleton.instance.closeConnection();
        }
    }
}

await RedisClientSingleton.setRedis(process.env.REDIS_CONNECTION_STRING);

export default RedisClientSingleton;