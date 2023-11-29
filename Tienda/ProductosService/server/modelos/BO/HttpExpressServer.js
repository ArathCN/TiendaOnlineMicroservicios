import express from 'express';
import UserGUIRouter from '../../routers/UserGUIRouter.js';
import ProductosRouter from '../../routers/ProductosRouter.js';
import BodyParser from 'body-parser';

const app = express();

app.use(BodyParser.json());

app.use('/', UserGUIRouter);
app.use('/productos', ProductosRouter);

export default app;