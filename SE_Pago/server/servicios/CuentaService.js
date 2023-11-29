import CuentaRepository from '../repositorios/CuentaRepository.js';
import GeneratePaymentCard from 'generate-payment-card';

const marcas = ['visa', 'mastercard', 'discover', 'american express'];

class CuentaService {

    /**
     * Crear una Cuenta en la base de datos.
     * @param {Object} datos - Objeto que contiene los datos, {nombre, apellidoPaterno, apellidoMaterno}, para crear una Cuenta.
     * @returns {Promise<String>} Retorna el ID autogenerado de la entrada creada en la base de datos.
     */
    static async Create (datos) {
        let index = Math.floor(Math.random() * (marcas.length + 1));
        let payment_card_details = GeneratePaymentCard.generate({
            "card_brand": marcas[index],
            "user_digits": { "status": false }
        })

        datos.tarjeta = payment_card_details;

        let cuentaID = await CuentaRepository.create(datos);

        let response = {
            "cuenta": cuentaID,
            "tarjeta": payment_card_details
        }

        return response;
    }

    /**
     * Incrementar el balance de una cuenta según el ID.
     * @param {string} id - ID de la cuenta a la que se le incrementará el balance.
     * @param {Number} inc - Cantidad en la que se incrementará el balance.
     */
    static async IncreaseDecreaseBalance (id, inc) {
        let response = await CuentaRepository.updateBalance(id, inc);

        return response;
    }

    static async FindByCard (cardData) {
        let response = await CuentaRepository.readByCard(cardData);

        return response;
    }
}

export default CuentaService;