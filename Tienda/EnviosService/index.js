import 'dotenv/config';
import app from './server/common/HttpExpressServer.js';
import ClienteMongo from './server/common/ClienteMongo.js';
import RedisClient from './server/common/utils/redis/RedisClient.js';
import PagoStreamService from './server/servicios/PagoStreamService.js';
import Streams from '../../common/constantes/Streams.mjs';

const clienteMongo = ClienteMongo.getInstance();
await RedisClient.setRedis(process.env.REDIS_CONNECTION_STRING);

app.listen(process.env.PORT, async () => {
    PagoStreamService.initialize(Streams.PAGO_STREAM_NAME, process.env.REDIS_CONSUMER_GROUP, process.env.REDIS_CONSUMER);
    console.log(`Servicio Envios escuchando en: http://localhost:${process.env.PORT}`)
})
  
process.on('SIGINT', async function() {
    await clienteMongo.cliente.close();
    await RedisClient.closeRedis();
    console.log("conección con BD cerradaa."); 
    process.exit(0); 
});