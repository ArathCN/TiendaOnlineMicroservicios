import PagoRepository from "../repositorios/PagoRepository.js";
import ExternalPaymentService from "./ExternalPaymentService.js";
import OrdenService from "./OrdenService.js";
import OrdenState from "../../../common/OrdenState.mjs";
import PagoStreamService from "./PagoStreamService.js";

class PagoService {

    /**
     * Crea una entrada de Pago en la Base de Datos.
     * @param {Object} pago - Objeto con las propiedades {orden, charge, transactionID, card}
     * @returns {Promise<String>} El ID autogenerado para la entrada creada.
     */
    static async Create (usuario, pago) {

        //consultar la orden
        let orden = null;
        try {
            orden = await OrdenService.ReadById(pago.orden);
        } catch (error) {
            if(error.response) throw new Error("Error en la llamada a Ordenes => " + error.response.data.mensaje);
            else throw error;
        }
        if (!orden) throw new Error("La orden no ha sido encontrada");
        if (orden.usuario != usuario) throw new Error("No se ha encontrado la orden del usuario");

        //Verificar que ya se haya establecido el envio.
        if(orden.estado != OrdenState.SHIPPING_INFO_SET){
            throw new Error("La orden no puede ser pagada aún estado: " + orden.estado);
        }

        //Sacar el total
        let total = 0;
        orden.productos.forEach(producto => {
            total += (producto.qty * producto.producto.price);
        });
        total += orden.envio.cost;
        pago.cargo = total;

        //Llamar al servicio externo de pago
        let transaccionID = await ExternalPaymentService.MakeTransaction(pago);

        //Crear la entrada de Pago enviarla a la bd
        let cardLastDigits = pago.cliente.tarjeta.substring(12);
        console.log("card: " + cardLastDigits);
        let pagoDetails = {
            "orden": orden._id,
            "charge": pago.cargo,
            "transactionID": transaccionID,
            "card": cardLastDigits
        }
        let pagoID = await PagoRepository.create(pagoDetails);

        //Avisar a Ordenes y Envios del pago
        await PagoStreamService.publish(orden._id, pagoID.toString());

        //
        return pagoID;
    }

    /**
     * Busca una entrada de Pago con el ID dado.
     * @param {String} id - El ID con el cual se buscará la entrada.
     * @returns {(Promise<Object>|null)} Retorna el objeto encontrado o null.
     */
    static async ReadById (id) {
        let pago = await PagoRepository.readById(id);

        return pago;
    }

    /**
     * SÓLO PARA PRUEBAS
     * @param {Object} pago 
     */
    static async CreateSimple(pago){
        //Crear la entrada de Pago enviarla a la bd
        let pagoDetails = {
            "orden": pago.orden,
            "charge": "123.123",
            "transactionID": "tra123",
            "card": "1234"
        }
        let pagoID = await PagoRepository.create(pagoDetails);

        //Avisar a Ordenes y Envios del pago
        await PagoStreamService.publish(pago.orden, pagoID.toString());

        return pagoID;
    }
}

export default PagoService;