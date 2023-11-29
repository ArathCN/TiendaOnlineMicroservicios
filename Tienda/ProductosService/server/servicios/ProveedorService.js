import Axios from 'axios';
import ProveedorMapper from '../modelos/mappers/ProveedorMapper.js';

class ProveedorService {
    static HOST = "http://localhost:82";
    static ALL_PATH = "/api/v1/proveedores?embed=true&all=true";
    static BY_ID_PATH = "/api/v1/proveedores/:id?embed=true";

    static async obtenerProveedores () {
        let respuesta;
        let proveedores = [];
        let uri = ProveedorService.HOST + ProveedorService.ALL_PATH;

        respuesta = await Axios.get(uri);

        if(respuesta.data !== null && respuesta.data.length > 0){
            proveedores = ProveedorMapper.arrayMap(respuesta.data);
        }

        return proveedores;
    }

    static async obtenerProveedorPorId (id) {
        let respuesta;
        let uri = ProveedorService.HOST + ProveedorService.BY_ID_PATH;
        let proveedor = null;

        uri = uri.replace(":id", id);

        respuesta = await Axios.get(uri);

        if(respuesta.data !== null && Object.keys(respuesta.data).length > 0){
            proveedor = ProveedorMapper.map(respuesta.data);
        }

        return proveedor;
    }
}

export default ProveedorService;