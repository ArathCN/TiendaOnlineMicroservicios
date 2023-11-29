import express from 'express';
import EnviosRouter from '../routers/EnviosRouter.js';
import BodyParser from 'body-parser';

const app = express();

app.use(BodyParser.json());

app.use('/api/v1/shippings', EnviosRouter);

export default app;