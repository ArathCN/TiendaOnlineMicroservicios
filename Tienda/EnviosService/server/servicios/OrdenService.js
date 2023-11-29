import Axios from 'axios';

class OrdenService {
    static HOST = "http://localhost:83";
    static BY_ID_PATH = "/ordenes/:id";

    /**
     * Consulta una Orden por su ID.
     * @param {string} id - ID  de la orden que se buscará.
     * @param {Array<String>} embed - Array para inlcuir información en la Orden. 
     * @returns {Promise<Object>} Retorna la orden consultada o null si no se encontró ninguna.
     */
    static async ReadById (id, embed) {
        let respuesta;
        let uri = OrdenService.HOST + OrdenService.BY_ID_PATH;
        let orden = null;

        uri = uri.replace(":id", id);

        if(embed && embed.length){
            let options = "?embed=" + embed.join(",");
            uri += options;
        }

        console.log(uri);
        respuesta = await Axios.get(uri);

        if(respuesta.data !== null && Object.keys(respuesta.data).length > 0){
            orden = respuesta.data;
        }

        return orden;
    }
}

export default OrdenService;