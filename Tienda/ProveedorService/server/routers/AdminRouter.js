const express = require('express');

const AdminRouter = express.Router();

AdminRouter.get('/', (req, res) => {
    res.send("Hola");
});

module.exports = AdminRouter;