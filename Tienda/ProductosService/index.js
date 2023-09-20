require('./server/modelos/BO/EnvConfig');
const app = require('./server/modelos/BO/HttpExpressServer');

app.listen(process.env.PORT, async () => {
    console.log(`Servicio Productos escuchando en: http://localhost:${process.env.PORT}`)
})
  
process.on('SIGINT', async function() {
    let clienteMongo = ClienteMongo.getInstance();
    await clienteMongo.cliente.close();
    console.log("conección con BD cerradaa."); 
    process.exit(0); 
});

process.on('SIGTERM', async function() {
    let clienteMongo = ClienteMongo.getInstance();
    await clienteMongo.cliente.close();
    console.log("conección con BD cerrada por nodemon.");
    process.exit(0);
});