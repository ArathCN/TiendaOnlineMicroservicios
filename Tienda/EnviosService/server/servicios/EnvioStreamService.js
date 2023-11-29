import { RedisStreams } from "../common/utils/redis/RedisStreams.js";
import Streams from "../../../../common/constantes/Streams.mjs";

class EnvioStreamService {
    static async publish(envioID, ordenID, estado) {
        let message = {"envio": envioID, "orden": ordenID, "estado": estado};
        await RedisStreams.addMessageToStream(message, Streams.ENVIO_STREAM_NAME);
        console.log("Se ha publicado una entrada en el stream ", Streams.ENVIO_STREAM_NAME);
    }
}

export default EnvioStreamService;