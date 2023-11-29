import {PaqueteriaContratoRepository, PaqueteriaContratoFieldNames} from "../repositorios/PaqueteriaContratoRepository.js";
import PaqueteriaService from "./PaqueteriaService.js";
import jsonPatch from 'fast-json-patch';

class PaqueteriaContratoService {

    static async Create (paqueteriaID, contrato) {

        let paqueteria = await PaqueteriaService.ReadById(paqueteriaID);
        if(!paqueteria) throw new Error("No se encontró la paqueteria con el ID dado");

        let contratoID = await PaqueteriaContratoRepository.Create(contrato);

        let res = await PaqueteriaService.UpdateById(paqueteriaID, {"contrato": contratoID});

        return contratoID;
    }

    static async ReadById (id) {
        let paqueteria = await PaqueteriaContratoRepository.ReadById(id);

        return paqueteria
    }

    static async UpdateById (id, operaciones){
        let contrato = await PaqueteriaContratoService.ReadById(id);
        if(!contrato) throw new Error("Contrato no encontrado");

        let errores = jsonPatch.validate(operaciones, contrato);
        //console.log(errores.length);
        if(errores){
            throw new Error(errores.message);
        }
        let res = await PaqueteriaContratoRepository.UpdateById(id, operaciones);

        return res;
    }
}

export default PaqueteriaContratoService;