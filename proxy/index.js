import 'dotenv/config';
import app from './server/common/HttpExpressServer.js';

app.listen(process.env.PORT, async () => {
    console.log(`Proxy escuchando en: http://localhost:${process.env.PORT}`)
})
