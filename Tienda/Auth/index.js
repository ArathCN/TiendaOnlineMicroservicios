import 'dotenv/config';
import app from './server/common/HttpExpressServer.js';
//import RedisClient from './server/common/utils/redis/RedisClient.js';

//await RedisClient.setRedis(process.env.REDIS_CONNECTION_STRING);

app.listen(process.env.PORT, async () => {
    console.log(`Servicio Auth escuchando en: http://localhost:${process.env.PORT}`)
})
  
process.on('SIGINT', async function() {
    await clienteMongo.cliente.close();
    await RedisClient.closeRedis();
    console.log("conección con BD cerradaa."); 
    process.exit(0); 
});