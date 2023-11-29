import Axios from 'axios';

class ProveedorService {
    static HOST = "http://localhost:82";
    static BY_ID_PATH = "/api/v1/proveedores/:id";

    static async ReadById (id) {
        let respuesta;
        let uri = ProveedorService.HOST + ProveedorService.BY_ID_PATH;
        let proveedor = null;

        uri = uri.replace(":id", id);

        respuesta = await Axios.get(uri);

        if(respuesta.data !== null && Object.keys(respuesta.data).length > 0){
            proveedor = respuesta.data;
        }

        return proveedor;
    }
}

export default ProveedorService;