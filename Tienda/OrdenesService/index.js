import 'dotenv/config';
import app from './server/modelos/BO/HttpExpressServer.js';
import ClienteMongo from './server/modelos/BO/ClienteMongo.js';
import RedisClient from './server/common/utils/redis/RedisClient.js';
import StreamService from './server/servicios/StreamService.js';

const clienteMongo = ClienteMongo.getInstance();
await RedisClient.setRedis(process.env.REDIS_CONNECTION_STRING);

app.listen(process.env.PORT, async () => {
    StreamService.initialize();
    console.log(`Servicio Ordenes escuchando en: http://localhost:${process.env.PORT}`)
})
  
process.on('SIGINT', async function() {
    await clienteMongo.cliente.close();
    await RedisClient.closeRedis();
    console.log("conección con BD cerradaa."); 
    process.exit(0); 
});