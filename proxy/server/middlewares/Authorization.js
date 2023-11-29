import AUTH_RULES from "../common/AuthorizationDefinition.js";

/**
 * Procesa la solicitud y la compara con los permisos del objeto AuthorizationChain para saber si el usuario tiene permiso para el recurso.
 * Se dice que se tiene permiso si la solicitud:
 * Se ha autenticado al usuario y cumple con el METODO, PATH y algunos de los PERMISOS establecidos en AuthorizationChain.
 * Se ha autenticado al usuario y no se encontró una regla para la solicitud.
 * No se ha autenticado al usuario y el PERMISO para el recurso es 'anonimo'.
 */
const Authorization = async (req, res, next) => {
    const ifAuth = AUTH_RULES.check(req);
    if(!ifAuth) return res.status(401).send({estado: "ERROR", mensaje: "Acceso no autorizado.", data: null});

    next();
}

export default Authorization;