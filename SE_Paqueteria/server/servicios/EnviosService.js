import {Client, TravelMode, Status} from '@googlemaps/google-maps-services-js';
import EnviosRepository from '../repositorios/EnviosRepository.js';
import EnvioState from '../common/constantes/EnvioState.js';

class EnviosService {
    static CLIENT = new Client();
    static PRICE_PER_KM = 0.055;
    static BASE_PRICE = 50;
    static CURRENCY = "MXN";

    static async Estimate (originAddress, destinationAddress) {

        //Consultar las coordenadas de las direcciones
        const originLocation = await EnviosServiceHelper.FindLocation(originAddress);
        const destinationLocation = await EnviosServiceHelper.FindLocation(destinationAddress);

        //Consultar la distancia entre las direcciones
        const distanceDetails = await EnviosServiceHelper.FindDistance(originLocation, destinationLocation);
        const distance = distanceDetails.distance.value;
        const duration = distanceDetails.duration.text;

        //Calcular el costo por envio
        let cost = EnviosService.BASE_PRICE + (distance / 1000 * EnviosService.PRICE_PER_KM);
        cost =  Number(cost.toFixed(2));

        return {cost: {text: "$" + cost + " " + EnviosService.CURRENCY, value: cost}, duration: distanceDetails.duration};
    }

    static async Create (originAddress, destinationAddress) {
        const estimate = await EnviosService.Estimate(originAddress, destinationAddress);

        let arrive = Date.now() + (estimate.duration.value * 1000);
        const arriveDate = new Date(arrive);

        const entry = {
            user: "USR001",
            origin: originAddress,
            destination: destinationAddress,
            cost: estimate.cost.value,
            arrive: arriveDate
        }

        let envioID = await EnviosRepository.create(entry);

        return envioID;
    }

    static async ReadById (id) {
        let envio = await EnviosRepository.ReadById(id);

        return envio;
    }

    static async UpdateState (id, state) {
        let siState = false;

        for (const key in EnvioState) {
            if(state == EnvioState[key]){
                siState = true;
                break;
            }
        }
        if(!siState) throw new Error("Estado invalido");

        const up = {
            state: state
        }

        let res = await EnviosRepository.UpdateById(id, up);

        return res;
    }
}

class EnviosServiceHelper {

    static async FindLocation (address) {
        const args = {
            params: {
                key: process.env.GOOGLE_MAPS_API_KEY,
                address: address,
            }
        };
        let res

        //Consultar las coordenadas de las direcciones
        try {
            res = await EnviosService.CLIENT.geocode(args);
        } catch (error) {
            throw new Error(`Error en el servicio de Google Maps => ${error.message}`);
        }

        if(res.data.status != Status.OK)
            throw new Error(res.data.error_message);
        if(!res.data.results.length)
            throw new Error(`No se encontró resultado para la dirección: '${address}'`);

        return res.data.results[0].geometry.location;
    }

    static async FindDistance(origin, destination) { 
        const argsDistance = {
            params: {
                key: process.env.GOOGLE_MAPS_API_KEY,
                origins: [origin],
                destinations: [destination],
                travelMode: TravelMode.driving
            }
        }
        let responseDistance = null;

        try {
            responseDistance = await EnviosService.CLIENT.distancematrix(argsDistance);
        } catch (error) {
            throw new Error(`Error en el servicio de Google Maps => ${error.message}`);
        }

        //Verificar que se haya consultado con exito
        if(responseDistance.status != 200)
            throw new Error(responseDistance.statusText);
        if(responseDistance.data.status != Status.OK)
            throw new Error(responseDistance.data.error_message);

        return responseDistance.data.rows[0].elements[0];
    }
}

export default EnviosService;