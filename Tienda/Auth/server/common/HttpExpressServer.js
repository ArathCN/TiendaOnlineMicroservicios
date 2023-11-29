import express from 'express';
import BodyParser from 'body-parser';
import AuthRouter from '../routers/AuthRouter.js';

const app = express();

app.use(BodyParser.json());

app.use('/auth', AuthRouter);

export default app;