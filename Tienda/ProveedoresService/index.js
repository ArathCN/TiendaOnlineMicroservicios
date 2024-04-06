require('./server/modelos/BO/EnvConfig');
const ClienteMongo =  require('./server/modelos/BO/ClienteMongo');
const APP = require('./server/modelos/BO/HttpExpressServer');


APP.listen(process.env.PORT, async () => {
    console.log(`Servicio Proveedores escuchando en: http://localhost:${process.env.PORT}`)
})
  
process.on('SIGINT', async function() {
    let clienteMongo = ClienteMongo.getInstance();
    await clienteMongo.cliente.close();
    console.log("conección con BD cerradaa."); 
    process.exit(0); 
});