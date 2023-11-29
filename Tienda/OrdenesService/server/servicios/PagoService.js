import Axios from 'axios';

class PagoService {
    static HOST = "http://localhost:85";
    static BY_ID = "/pagos/:id";

    static async ReadById (ID) {
        let respuesta;
        let uri = PagoService.HOST + PagoService.BY_ID;

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

export default PagoService;