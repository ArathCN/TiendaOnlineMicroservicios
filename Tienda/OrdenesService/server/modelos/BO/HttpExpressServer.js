import express from 'express';
import UserGUIRouter from '../../routers/UserGUIRouter.js';
import OrdenesRouter from '../../routers/OrdenesRouter.js';
import BodyParser from 'body-parser';

const app = express();

app.use(BodyParser.json());

app.use('/', UserGUIRouter);
app.use('/ordenes', OrdenesRouter);

export default app;