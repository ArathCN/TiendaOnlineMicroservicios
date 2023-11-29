import PaqueteriaRepository from "../repositorios/PaqueteriaRepository.js";
import OrdenService from "./OrdenService.js";
import { APIContractResolver, APIContract, APIContractResolverOptions } from '../common/APIContractResolver.js';

class PaqueteriaService {

    static async Create (paqueteria) {

        let res = await PaqueteriaRepository.Create(paqueteria);

        return res;
    }

    static async ReadAll () {
        let paqueterias = await PaqueteriaRepository.Read();

        return paqueterias;
    }

    static async ReadById (id, embed) {
        let paqueteria = await PaqueteriaRepository.ReadById(id, embed);

        return paqueteria
    }
    
    static async UpdateById (id, campos) {
        let res = await PaqueteriaRepository.UpdateById(id, campos);

        return res;
    }

    static async Estimate (usuario, ordenID, paqueteriaID, destino) {
        let proveedores = [];

        //Consultar la orden.
        let orden = null;
        try {
            orden = await OrdenService.ReadById(ordenID, ["proveedor"]);
        } catch (error) {
            if(error.response) throw new Error(error.response.data.mensaje);
            if(error.request) throw new Error("No es posible consultar la orden en este momento");
        }
        if(!orden) throw new Error("No se encontró la orden.");
        //if(orden.usuario != usuario) throw new Error("No se encontró la orden del usuario.");

        //Extraer los subenvios a hacer en base a los productos ordenados
        //Se agrupan los productos por proveedor.
        orden.productos.forEach(producto => {
            if (proveedores[producto.proveedor.id] === undefined) {
                proveedores[producto.proveedor.id] = {
                    "name": producto.proveedor.name,
                    "address": producto.proveedor.address,
                    "productos": [{"id": producto.id, "qty": producto.qty}]
                };
            }else{
                proveedores[producto.proveedor.id].productos.push({"id": producto.id, "qty": producto.qty});
            }
        });
        console.log("proveedores", proveedores);

        //Buscar la paqueteria
        const paqueteria = await PaqueteriaService.ReadById(paqueteriaID, true);
        if(!paqueteria) throw new Error("No se encontró la paqueteria dada");
        if(!paqueteria.contrato) throw new Error("La paqueteria aún no puede ser usada");

        let contrato = new APIContract(
            paqueteria.contrato._id,
            paqueteria.contrato.host,
            paqueteria.contrato.path,
            paqueteria.contrato.authentication,
            paqueteria.contrato.endpoints
        );

        let apiContractResolver = new APIContractResolver(contrato);

        let destination = `${destino.street}, ${destino.zipCode}, ${destino.city}, ${destino.state}, ${destino.country}`;
        let costos = [];
        for (const prov in proveedores) {
            let add = `${proveedores[prov].address.street}, ${proveedores[prov].address.zipCode}, ${proveedores[prov].address.city}, ${proveedores[prov].address.state}, ${proveedores[prov].address.country}`;
            let options = new APIContractResolverOptions(
                undefined,
                {
                    "originAddress": add,
                    "destinationAddress": destination
                }
            );

            try {
                apiContractResolver.resolve();
                let respuesta = await apiContractResolver.call("estimate", options);
                console.log(respuesta)
                if (respuesta.code < 300) costos.push(respuesta.data);
                else throw new Error(`Error al consultar al servicio de paqueteria => ${respuesta.data.message}`);
                
            } catch (err) {
                throw new Error (`Error en el contrato => ${err.message}`);
            }
        }

        let costoTotal = 0;
        let mayorDuracion = 0;
        let mayorDuracionText = "";
        costos.forEach(costo => {
            costoTotal += costo.cost.value;
            if(costo.duration.value > mayorDuracion){
                mayorDuracion = costo.duration.value;
                mayorDuracionText = costo.duration.text;
            }
        });

        let res = {
            "costo": costoTotal,
            "duracion": mayorDuracionText
        }


        console.log("costos", costos);
        return res;
    }

    static async EstimateInternal (proveedores, paqueteriaID, destino) {

        //Buscar la paqueteria
        const paqueteria = await PaqueteriaService.ReadById(paqueteriaID, true);
        if(!paqueteria) throw new Error("No se encontró la paqueteria dada");
        if(!paqueteria.contrato) throw new Error("La paqueteria aún no puede ser usada");

        let contrato = new APIContract(
            paqueteria.contrato._id,
            paqueteria.contrato.host,
            paqueteria.contrato.path,
            paqueteria.contrato.authentication,
            paqueteria.contrato.endpoints
        );

        let apiContractResolver = new APIContractResolver(contrato);

        let destination = `${destino.street}, ${destino.zipCode}, ${destino.city}, ${destino.state}, ${destino.country}`;
        let costos = [];
        for (const prov in proveedores) {
            let add = `${proveedores[prov].address.street}, ${proveedores[prov].address.zipCode}, ${proveedores[prov].address.city}, ${proveedores[prov].address.state}, ${proveedores[prov].address.country}`;
            let options = new APIContractResolverOptions(
                undefined,
                {
                    "originAddress": add,
                    "destinationAddress": destination
                }
            );

            try {
                apiContractResolver.resolve();
                let respuesta = await apiContractResolver.call("estimate", options);
                console.log(respuesta)
                if (respuesta.code < 300) costos.push(respuesta.data);
                else throw new Error(`Error al consultar al servicio de paqueteria => ${respuesta.data.message}`);
                
            } catch (err) {
                throw new Error (`Error en el contrato => ${err.message}`);
            }
        }

        let costoTotal = 0;
        let mayorDuracion = 0;
        let mayorDuracionText = "";
        costos.forEach(costo => {
            costoTotal += costo.cost.value;
            if(costo.duration.value > mayorDuracion){
                mayorDuracion = costo.duration.value;
                mayorDuracionText = costo.duration.text;
            }
        });

        let res = {
            "costo": costoTotal,
            "duracion": mayorDuracionText
        }


        console.log("costos", costos);
        return res;
    }
}

export default PaqueteriaService;