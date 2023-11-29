import TransaccionApiCodeStatus from "../../../common/constantes/TransaccionApiCodeStatus.mjs";
import CuentaRepository from "../repositorios/CuentaRepository.js";
import TransaccionRepository from "../repositorios/TransaccionRepository.js";

class TransaccionServiceCreateResponse {
    constructor(codigo, mensaje, datos){
        this.codigo = codigo;
        this.mensaje = mensaje;
        this.datos = datos || null;
    }
}

class TransaccionService {

    /**
     * Crea una transacció además de aplicar los cargos a las respectivas cuentas.
     * @param {Object} transaccion - Objeto con las propiedades para crear una transaccion.
     * @returns {Promise<TransaccionServiceCreateResponse>} ID autogenerado de la entrada de transaccion.
     */
    static async Create (transaccion) {
        let origen = await CuentaRepository.readByCard(transaccion.origen);
        let destino = await CuentaRepository.readById(transaccion.destino);

        if(origen == null) 
            return new TransaccionServiceCreateResponse(TransaccionApiCodeStatus.ORIGEN_NOT_FOUND, "La cuenta origen no fue encontrada");
        if(destino == null)
            return new TransaccionServiceCreateResponse(TransaccionApiCodeStatus.DESTINO_NOT_FOUND, "La cuenta destino no fue encontrada");

        transaccion.origen = origen._id;

        let balances = await CuentaRepository.updateBalanceTransaction(origen._id, destino._id, transaccion.cargo);
        if(balances.hasOwnProperty("error") && balances.error == true)
            return new TransaccionServiceCreateResponse(TransaccionApiCodeStatus.ORIGEN_INSUFFICIENT_BALANCE, balances.mensaje);


        let transaccionID = await TransaccionRepository.Create(transaccion);

        return new TransaccionServiceCreateResponse(TransaccionApiCodeStatus.OK, "OK", transaccionID);
    }

    static async ReadById (id) {
        let response = await TransaccionRepository.ReadById(id);

        return response;
    }
}

export {TransaccionServiceCreateResponse, TransaccionService};