import { createProxyMiddleware } from 'http-proxy-middleware';

const setupProxies = (app, routes) => {
    routes.forEach(r => {
        r.proxy.onProxyReq = proxyReq;
        r.proxy.onError = error;
        app.use(r.url, createProxyMiddleware(r.proxy));
    })
}

//Adjuntamos a la solicitud el ID del usuario autenticado, si existe uno.
const proxyReq = (proxyReq, req, res) => {
    console.log("Antes de enviar solicitud");
    if(req.user)
        proxyReq.setHeader("user", req.user.id);
};

//Si hubo un error en la solicitud aqui se maneja.
const error = (err, req, res, target) => {
    console.log(err.message, target);
    res.status(500).send({estado: "ERROR", mensaje: "Ha ocurrdo un error con la solicitud, intente más tarde.", data: null});
}

export default setupProxies;