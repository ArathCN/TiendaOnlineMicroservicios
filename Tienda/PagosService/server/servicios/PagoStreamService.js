import { RedisStreams } from "../common/utils/redis/RedisStreams.js";
import Streams from "../../../../common/constantes/Streams.mjs";

class PagoStreamService {
    static async publish(orden, pago) {
        let message = {"pago": pago, "orden": orden};
        await RedisStreams.addMessageToStream(message, Streams.PAGO_STREAM_NAME);
        console.log("Se ha publicado una entrada en el stream ", Streams.PAGO_STREAM_NAME);
    }
}

export default PagoStreamService;