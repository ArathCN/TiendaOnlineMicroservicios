import User from '../modelos/User.js';
import {AuthService, AuthResponse} from '../servicios/AuthService.js';

/**
 * Procesa el header de authentication, si lo hay, si ocurre un erorr el verificarlo retorna 401
 */
const Authentication = async (req, res, next)=>{
    let authHeader = req.header('authorization');

    //if (!authHeader) return res.status(401).send({estado: "ERROR", mensaje: "Acceso denegado", data: null});
    if(!authHeader) return next();

    let token = authHeader.split(" ");
    if(token.length == 2) token = token[1];
    else return res.status(401).send({estado: "ERROR", mensaje: "Especificación del header invalida", data: null});

    try {
        const resp = await AuthService.Verify(token);
        if(resp.code >= 400) return res.status(401).send(resp);

        req.user = resp.data;
        //req.set()
        //res.set("user", resp.data.id);
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).send({estado: "ERROR", mensaje: error.message, data: null});
    }
}

export default Authentication;