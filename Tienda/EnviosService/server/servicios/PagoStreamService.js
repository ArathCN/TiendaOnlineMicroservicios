import { RedisStreams, ListenStreamOptions } from "../common/utils/redis/RedisStreams.js";

class PagoStreamService {
    static async initialize(stream, groupName, consumerName) {

        //comprobar entradas pendientes...
        await RedisStreams.checkPendingEntries(new ListenStreamOptions(
            [
                {
                    "streamKeyName": "pagos",
                    "eventHandler": PagoStreamService.streamPendingEntriesHandler
                }
            ],
            groupName,
            consumerName,
            100
        ));

        //Escuchar al stream de pagos
        RedisStreams.listenToStreams(
            new ListenStreamOptions(
                [
                    {
                        "streamKeyName": stream,
                        "eventHandler": PagoStreamService.streamHandler
                    }
                ],
                groupName,
                consumerName,
                100
            )
        );
        console.log(`Escuchando al stream ${stream}...`);
    }

    /**
     * Procesa las entradas del stream cuando son ingresadas por algún productor.
     * @param {String} message - La entrada del stream a procesar.
     * @param {Number} id - El ID de la entrada del stream.
     */
    static streamHandler(message, id) {
        console.log(`Pago recibido, id ${message.pago}`);
    }

    /**
     * Reprocesa las entradas que fueron tratadas de procesar anteriormente,
     * o procesa las entradas que se ingresaron al stream cuando el servico estaba inactivo.
     * @param {String} message - La entrada del stream a procesar.
     * @param {Number} id - El ID de la entrada del stream.
     */
    static streamPendingEntriesHandler(message, id) {
        console.log(`Pago pendiente recibido, id ${message.pago}`);
    }
}

export default PagoStreamService;
