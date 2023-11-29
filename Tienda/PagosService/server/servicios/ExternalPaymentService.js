import Axios from 'axios';
import TransaccionApiCodeStatus from '../../../../common/constantes/TransaccionApiCodeStatus.mjs';

class ExternalPaymentService {
    static HOST = "http://localhost:86";
    static MAKE_TRANSACTION = "/transacciones";

    static async MakeTransaction (transaccion){
        let respuesta;
        let uri = ExternalPaymentService.HOST + ExternalPaymentService.MAKE_TRANSACTION;
        let _transaccion = null;

        let body = {
            "origen": {
                "tarjeta": transaccion.cliente.tarjeta,
                "codigo": transaccion.cliente.codigo,
                "vencimiento": transaccion.cliente.vencimiento,
                "nombre": transaccion.cliente.nombre,
                "apellidoPaterno": transaccion.cliente.apellidoPaterno,
                "apellidoMaterno": transaccion.cliente.apellidoMaterno
            },
            "destino": process.env.PAYMENT_ACCOUNT,
            "cargo": transaccion.cargo
        }

        try {
            respuesta = await Axios.post(uri, body);
        } catch (error) {
            if (error.response) {
                throw new Error (`Llamada a servicio externo de pago con error ${error.response.status}: ${error.response.data.mensaje}`);
            } else if (error.request) {
            throw new Error ("La llamada a servicio externo de pago no tuvo respuesta.");
            } else {
                throw error;
            }
        }

        if(respuesta.data.estado == TransaccionApiCodeStatus.OK) _transaccion = respuesta.data.data;
        else throw new Error("Error en el servicio externo de pago => " + respuesta.data.mensaje);
        

        return _transaccion;
    }
}

export default ExternalPaymentService;