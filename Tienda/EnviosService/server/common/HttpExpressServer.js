import express from 'express';
import UserGUIRouter from '../routers/UserGUIRouter.js';
import EnviosRouter from '../routers/EnviosRouter.js';
import PaqueteriaRouter from '../routers/PaqueteriaRouter.js';
import PaqueteriaContratoRouter from '../routers/PaqueteriaContratoRouter.js';
import BodyParser from 'body-parser';

const app = express();

app.use(BodyParser.json());

app.use('/', UserGUIRouter);
app.use('/envios', EnviosRouter);
app.use('/paqueterias', PaqueteriaRouter);
app.use('/paqueterias/contratos', PaqueteriaContratoRouter);

export default app;