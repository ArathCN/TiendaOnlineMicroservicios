import { RedisStreams, ListenStreamOptions } from "../common/utils/redis/RedisStreams.js";
import Streams from "../../../../common/constantes/Streams.mjs";
import OrdenState from "../../../common/OrdenState.mjs";
import OrdenesService from "./OrdenesService.js";

const STREAM_PAGO = Streams.PAGO_STREAM_NAME;
const STREAM_ENVIO = Streams.ENVIO_STREAM_NAME;
const CONSUMER_GROUP = process.env.REDIS_CONSUMER_GROUP;
const CONSUMER = process.env.REDIS_CONSUMER;
const ENTRIES_AT_TIME = 50;

class StreamService {
    static async initialize() {

        //comprobar entradas pendientes...
        await RedisStreams.checkPendingEntries(new ListenStreamOptions(
            [
                {
                    "streamKeyName": STREAM_ENVIO,
                    "eventHandler": StreamService.envioStreamPendingEntriesHandler
                },
                {
                    "streamKeyName": STREAM_PAGO,
                    "eventHandler": StreamService.pagoStreamPendingEntriesHandler
                }
                
            ],
            CONSUMER_GROUP,
            CONSUMER,
            ENTRIES_AT_TIME
        ));

        //Escuchar al stream de pagos
        RedisStreams.listenToStreams(
            new ListenStreamOptions(
                [
                    {
                        "streamKeyName": STREAM_ENVIO,
                        "eventHandler": StreamService.envioStreamHandler
                    },
                    {
                        "streamKeyName": STREAM_PAGO,
                        "eventHandler": StreamService.pagoStreamHandler
                    }
                    
                ],
                CONSUMER_GROUP,
                CONSUMER,
                ENTRIES_AT_TIME
            )
        );
        console.log(`Escuchando los streams ${STREAM_PAGO, STREAM_ENVIO}...`);
    }

    /**
     * Procesa las entradas del stream cuando son ingresadas por algún productor.
     * @param {String} message - La entrada del stream a procesar.
     * @param {Number} id - El ID de la entrada del stream.
     */
    static async pagoStreamHandler(message, id) {
        //Consultar la orden...
        let orden = await OrdenesService.ReadById(message.orden);
        if(!orden) throw new Error(`La orden '${message.orden}' no existe.`);

        //Verificar si a la orden ya se le ha establecido el envio.
        if(orden.estado != OrdenState.SHIPPING_INFO_SET)
            throw new Error(`No se puede actualizar la orden. Tiene un estado diferente al esperado.`);

        //Actualizar la orden
        let siActualizado = await OrdenesService.UpdateState(message.orden, OrdenState.PAID, message.pago);
    }

    static async envioStreamHandler(message, id) {
        //Consultar la orden...
        let orden = await OrdenesService.ReadById(message.orden);
        if(!orden) throw new Error(`La orden '${message.orden}' no existe.`);

        //Verificar si el estado de la orden es el correcto según el estado al que se quiere actualizar...
        if(message.estado == OrdenState.SHIPPING_INFO_SET && orden.estado != OrdenState.CREATED)
            throw new Error(`No se puede actualizar los datos de envio de la orden.`);
        if(
            ((message.estado == OrdenState.SENDING && orden.estado != OrdenState.PAID) ||
            (message.estado == OrdenState.DELIVERED && orden.estado != OrdenState.SENDING)) &&
            (orden.envio != message.envio)
        )
            throw new Error(`No se puede actualizar el estado de la orden.`);

        //Actualizar la orden
        let siActualizado = null;
        if(message.envio)
            siActualizado = await OrdenesService.UpdateState(message.orden, parseInt(message.estado, 10), message.envio);
        else
            siActualizado = await OrdenesService.UpdateState(message.orden, parseInt(message.estado, 10));
    }

    /**
     * Reprocesa las entradas que fueron tratadas de procesar anteriormente,
     * o procesa las entradas que se ingresaron al stream cuando el servico estaba inactivo.
     * @param {String} message - La entrada del stream a procesar.
     * @param {Number} id - El ID de la entrada del stream.
     */
    static async pagoStreamPendingEntriesHandler(message, id) {
        //Consultar la orden...
        let orden = await OrdenesService.ReadById(message.orden);
        if(!orden) throw new Error(`La orden '${message.orden}' no existe.`);

        //Verificar si a la orden ya se le ha establecido el envio.
        if(orden.estado >= OrdenState.PAID){
            console.log(`La entrada '${id}' ya había sido procesada correctamente.`);
            return;
        }

        //Actualizar la orden
        let siActualizado = await OrdenesService.UpdateState(message.orden, OrdenState.PAID, message.pago);
    }

    /**
     * Comprueba si una entrada del stream fue procesada correctamente, en caso de que no haya sido así
     * es reprocesada.
     * Es procesada correctamente cuando el estado de la orden es anterior al estado de la entrada.
     * @param {*} message 
     * @param {*} id 
     */
    static async envioStreamPendingEntriesHandler(message, id) {
        //Consultar la orden...
        let orden = await OrdenesService.ReadById(message.orden);
        if(!orden) throw new Error(`La orden '${message.orden}' no existe.`);

        //Verificar si el estado de la orden ya es igual al de la entrada o mayor, es decir, que ya ha sido procesada y ha avanzado
        //en su proceso
        if(
            (orden.estado >= message.estado)
            ){
            console.log(`La entrada '${id}' ya había sido procesada correctamente.`);
            return;
        }

        //Verificar que el envio sí esté queriendo actualizar a al orden correcta
        if(message.estado > OrdenState.SHIPPING_INFO_SET && orden.envio != message.envio)
            throw new Error(`El envio no coincide con el registrado en la orden.`);

        //Actualizar la orden
        let siActualizado = null;
        if(message.envio)
            siActualizado = await OrdenesService.UpdateState(message.orden, parseInt(message.estado, 10), message.envio);
        else
            siActualizado = await OrdenesService.UpdateState(message.orden, parseInt(message.estado, 10));
    }
}

export default StreamService;
