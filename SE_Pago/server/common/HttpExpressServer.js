import express from 'express';
import BodyParser from 'body-parser';
import TransaccionRouter from '../routers/TransaccionRouter.js';
import CuentaRouter from '../routers/CuentaRouter.js';

const app = express();

app.use(BodyParser.json());

app.use('/transacciones', TransaccionRouter);
app.use('/cuentas', CuentaRouter)

export default app;