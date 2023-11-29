const express = require('express');
const body_parser = require('body-parser');
require('./loadEnviroment');
const ClienteMongo = require('./server/modelos/BO/ClienteMongo');
const routerProductos = require('./server/routers/ProductoRouter');

let clienteMongo = ClienteMongo.getInstance();

const app = express();
app.use(body_parser.json());
app.use('/productos', routerProductos);

app.listen(process.env.PORT, () => {
    console.log("App 'Proveedor 1' escuchando el puerto: " + process.env.PORT);
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
