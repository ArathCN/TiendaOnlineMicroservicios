import 'dotenv/config';
import app from './server/common/HttpExpressServer.js';
import ClienteMongo from './server/common/ClienteMongo.js';

const clienteMongo = ClienteMongo.getInstance();

app.listen(process.env.PORT, async () => {
    console.log(`Servicio externo Pago escuchando en: http://localhost:${process.env.PORT}`)
})
  
process.on('SIGINT', async function() {
    await clienteMongo.cliente.close();
    console.log("conección con BD cerradaa."); 
    process.exit(0); 
});