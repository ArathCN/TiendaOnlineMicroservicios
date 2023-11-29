import axios from "axios";

class AuthResponse {
    constructor(code, message, data){
        this.code = code;
        this.message = message;
        this.data = data;
    }
}

class AuthService {
    static HOST = "http://localhost:90";
    static VERIFY = "/auth/verify";
    static AUTH_HEADER = "authorization";
    static HEADER_VALUE_PREFIX = "Bearer ";

    static async Verify(token) {
        const URL = AuthService.HOST + AuthService.VERIFY;
        const auth = AuthService.HEADER_VALUE_PREFIX + token;
        const config = {
            headers: {[AuthService.AUTH_HEADER]: auth}
        }
        let response = null;

        try {
            let res = await axios.get(URL, config);
            response = new AuthResponse(axios.HttpStatusCode.Ok, res.data.mensaje, res.data.data);
        } catch (error) {
            if (error.response) {
                if(error.response.status == axios.HttpStatusCode.Unauthorized)
                    response = new AuthResponse(error.response.status, error.response.data.mensaje, error.response.data.data);
                else
                    throw new Error("Error en el servicio Auth => " + error.response.data.mensaje);
            }
            else if(error.request) throw new Error("No se recibió respuesta del servicio Auth");
            else throw error;
        }

        return response;
    }
}

export {AuthService, AuthResponse};