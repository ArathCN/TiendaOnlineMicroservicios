import 'dotenv/config';
import app from './server/modelos/BO/HttpExpressServer.js';

app.listen(process.env.PORT, async () => {
    console.log(`Servicio Productos escuchando en: http://localhost:${process.env.PORT}`)
})