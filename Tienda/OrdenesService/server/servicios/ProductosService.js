import Axios from 'axios';

class ProductosService {
    static HOST = "http://localhost";
    static BY_IDS = "/productos/getProducts";
    static UPDATE_INVENTORY = "/productos/updateInventory";

    static async ReadByIds (ids) {
        let respuesta;
        let uri = ProductosService.HOST + ProductosService.BY_IDS;
        
        let params = {"params": {"products": ids}};
        
        try {
            respuesta = await Axios.get(uri, params);
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

    static async UpdateInventory (products) {
        let respuesta;
        let uri = ProductosService.HOST + ProductosService.UPDATE_INVENTORY;
        
        //let body = {"params": {"products": ids}};
        
        try {
            respuesta = await Axios.patch(uri, products);
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

export default ProductosService;