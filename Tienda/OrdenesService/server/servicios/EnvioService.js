import Axios from 'axios';

class EnvioService {
    static HOST = "http://localhost:84";
    static BY_ID = "/envios/:id";

    static async ReadById (ID) {
        let respuesta;
        let uri = EnvioService.HOST + EnvioService.BY_ID;

        uri = uri.replace(":id", ID);

        try {
            respuesta = await Axios.get(uri);
        } catch (error) {
            if (error.response) {
                throw new Error (`Llamada con error ${error.response.status}: ${error.response.data.mensaje}`);
            } else if (error.request) {
            throw new Error ("La llamada a Productos no tuvo respuesta.");
            } else {
                throw error;
            }
        }

        return respuesta.data;
    }
}

export default EnvioService;