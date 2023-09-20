const Axios = require('axios');

class ProveedorService {
    constructor () {
        this.host = "http:localhost:82";
        this.path = "/api/v1/proveedores";
    }

    async obtenerProveedores () {
        let respuesta;
        let uri = this.host + this.path;
        try {
            respuesta = await Axios.getAdapter(uri, {params: {all: true}});
        } catch (error) {
            throw new Error("Hubo un error al consultar los proveedores => " + error.message);
        }

        return respuesta;
    }
}