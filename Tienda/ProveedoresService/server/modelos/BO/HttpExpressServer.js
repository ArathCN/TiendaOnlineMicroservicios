const express = require('express');
const ProveedorRouter = require('../../routers/ProveedorRouter');
const ContratoRouter = require('../../routers/ContratoRouter');
const BodyParser = require('body-parser');

const app = express();

app.use(BodyParser.json());

app.use('/api/v1/proveedores', ProveedorRouter);
app.use('/api/v1/contratos', ContratoRouter);

module.exports = app;