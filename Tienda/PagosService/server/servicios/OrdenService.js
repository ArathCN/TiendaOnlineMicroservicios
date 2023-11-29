import Axios from "axios";

class OrdenService {
    static HOST = "http://localhost:83";
    static READ_BY_ID = "/ordenes/:id?embed=envio,producto";

    static async ReadById (id) {
        let respuesta;
        let uri = OrdenService.HOST + OrdenService.READ_BY_ID;
        let orden = null;

        uri = uri.replace(":id", id);

        respuesta = await Axios.get(uri);

        orden = respuesta.data;

        return orden;
    }
}

export default OrdenService;