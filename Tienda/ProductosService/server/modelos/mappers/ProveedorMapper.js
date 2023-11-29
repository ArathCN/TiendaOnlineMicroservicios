import Proveedor from '../DTO/Proveedor.js';
import {MapperError, MapperErrorCode} from './MapperError.js';

class ProveedorMapper {

    static arrayMap(array){
        if(array === undefined || array === null || array.length === 0){
            throw new MapperError(MapperErrorCode.EMPTY_NULL_UNDEFINED_OBJECT, "El array a mapear no está definido o es nulo o es un array vacio.");
        }

        let proveedores = array.map(function(element) {

            if (
                !element.hasOwnProperty('_id') ||
                !element.hasOwnProperty('name') ||
                !element.hasOwnProperty('contrato')
            ) {
                console.log(element);
                throw new MapperError(MapperErrorCode.UNKNOWN_OBJECT, "Los elementos del array no cumplen con las propiedades esperadas.");
                
            }

            let proveedor = null;
            if(element.contrato && element.contrato.length){
                proveedor = new Proveedor(
                    element._id,
                    element.name,
                    element.contrato[0]
                );
            }else{
                proveedor = new Proveedor(
                    element._id,
                    element.name,
                    null
                );
            }
            return proveedor;
        });

        return proveedores;
    }

    static map(proveedor){
        if(proveedor === undefined || proveedor === null || (Object.keys(proveedor).length === 0 && proveedor.constructor === Object)){
            throw new MapperError(MapperErrorCode.EMPTY_NULL_UNDEFINED_OBJECT, "El objeto a mapear no está definido o es nulo o es un objeto vacio.");
        }

        if (
            !proveedor.hasOwnProperty('_id') ||
            !proveedor.hasOwnProperty('name') ||
            !proveedor.hasOwnProperty('contrato') || proveedor.contrato[0] === undefined
        ) {
            throw new MapperError(MapperErrorCode.UNKNOWN_OBJECT, "El objeto no cumple con las propiedades esperadas.");
            
        }

        let _proveedor = new Proveedor(
            proveedor._id,
            proveedor.name,
            proveedor.contrato[0]
        );
        return _proveedor;
    }
}

export default ProveedorMapper;