import express from 'express';
import BodyParser from 'body-parser';
import UserGUIRouter from '../routers/UserGUIRouter.js';
import PagoRouter from '../routers/PagoRouter.js';

const app = express();

app.use(BodyParser.json());

app.use('/', UserGUIRouter);
app.use('/pagos', PagoRouter);

export default app;