import express from 'express';
//import BodyParser from 'body-parser';
import setupRateLimiter from '../middlewares/RateLimit.js';
import setupLogging from '../middlewares/logging.js';
import cors from 'cors';
import helmet from 'helmet';
import Authentication from '../middlewares/Authentication.js';
import Authorization from '../middlewares/Authorization.js';
import ROUTES from './Routes.js';
import setupProxies from '../middlewares/Proxy.js';

const app = express();

//middlewares
setupRateLimiter(app);
setupLogging(app);
app.use(cors());
app.use(helmet());
app.use(Authentication);
app.use(Authorization);

setupProxies(app, ROUTES);


export default app;