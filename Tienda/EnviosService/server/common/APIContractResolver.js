import Axios from 'axios';
import jsonToUrl from '@autotrof/json-to-url';
import clone from 'clone';

const RESPONSE_SCHEMA_MAPPER = "responseSchemaMapper";
const RESPONSE_TYPE = "responseType";

class APIContractResolverErrorCode {
    static INVALID_ENDPOINT = 100;
    static ENDPOINT_NO_EXISTS = 101;
    static PATH_VARIABLE_REQUIRED = 102;
    static QUERY_VARIABLES_REQUIRED = 103;
    static BODY_VARIABLES_REQUIRED = 104;
    static CALL_NO_RESPONSE_RECIVED = 105;
    static CALL_ERROR = 106;
    static INVALID_RESPONSE_TYPE = 107;

    static BAD_QUERY_SPECIFICATION = 200;
    static BAD_BODY_SPECIFICATION = 201;
    static BAD_RESPONSE_TYPE_SPECIFICATION = 202;
    static BAD_RESPONSE_MAPPER_SPECIFICATION = 203;
}

class APIContractResolverError extends Error {
    constructor(code, message){
        super(message);
        this.code = code;
    }
}

class APIContract {
    constructor (id, host, path, authentication, endpoints) {
        this._id = id || 0;
        this.host = host || "";
        this.path = path || "";
        this.authentication = authentication || null;
        this.endpoints = endpoints || [];
    }
}

class Endpoint {
    constructor (path, pathVariables, queryVariables, body, method, responseType, responseSchemaMapper) {
        this.path = path || "/";
        this.pathVariables = pathVariables || null;
        this.queryVariables = queryVariables || null;
        this.body = body || null;
        this.method = method || "GET";
        this.responseType = responseType || null;
        this.responseSchemaMapper || null;
    }
}

class APIContractResolverOptions {
    static PATH_VARIABLES = "path";
    static QUERY_VARIABLES = "query";
    static BODY = "body";

    constructor (path, query, body) {
        this.path = path || {};
        this.query = query || {};
        this.body = body || {};
    }
}

class APIContractResolverResponse {
    constructor (code, data) {
        this.code = code || 200;
        this.data = data || null;
    }
}

class APIContractResolver {
    constructor (contract) {
        if(contract instanceof APIContract)
            this.contract = contract;
        else
            throw Error("Contract debe ser de tipo APIContract");
        this.objectsResponse = [];
        this.endpoints = [];
    }

    resolve () {
        this.contract.endpoints.forEach(endpoint => {
            let nombre = Object.keys(endpoint)[0];
            let valores = Object.values(endpoint)[0];

            let siCoincide = true;
            for (const key in new Endpoint()) {
                if (!valores.hasOwnProperty(key)) {
                    siCoincide = false;
                }
            }

            if(!siCoincide){
                throw new APIContractResolverError(APIContractResolverErrorCode.INVALID_ENDPOINT,
                    `El endpoint '${nombre}' no es del tipo Endpoint valido`);
            }

            this.endpoints[nombre] = valores;
        });
    }

    async call (endpoint, op) {
        let options = op || new APIContractResolverOptions();
        let endpointTarget = clone(this.endpoints[endpoint]);
        let path = this.contract.host + this.contract.path + endpointTarget.path;
        let body = options.body;
        let respuesta;
        let method = endpointTarget.method.toLowerCase();

        if(endpointTarget === undefined){
            throw new APIContractResolverError(APIContractResolverErrorCode.ENDPOINT_NO_EXISTS,
                "El endpoint solicitado no existe")
        }

        //verificar si se envian los datos de path correctos
        if (endpointTarget.pathVariables != null){
            endpointTarget.pathVariables.forEach(variable => {
                if (!options.path.hasOwnProperty(variable)) throw new APIContractResolverError(APIContractResolverErrorCode.PATH_VARIABLE_REQUIRED,
                    `La llamada al enpoint necesita el parametro '${variable}'`);
                
                if (variable.match(/,\.\.\./)) {
                    path = path.replace(variable, options.path[variable].join(","))
                } else {
                    path = path.replace(variable, options.path[variable]);
                }
                
            });
        }

        //verificar si se envian los datos query correctos
        if(endpointTarget.queryVariables != null){
            let objetoQuery;
            let query = options.query;
            if (Object.entries(query).length === 0) query = null;
            try {
                objetoQuery = this.schemaResolver(query, endpointTarget.queryVariables);
            } catch (error) {
                throw new APIContractResolverError(APIContractResolverErrorCode.BAD_QUERY_SPECIFICATION,
                    "La especificación de parametros query no está bien definida => " + error.message);
            }
            if(!objetoQuery) throw new APIContractResolverError(APIContractResolverErrorCode.QUERY_VARIABLES_REQUIRED,
                "Los parametros query no coinciden con los especificados en el contrato.");
            let params = jsonToUrl(options.query);
            path = path + "?" + decodeURI(params);
        }

        //Verificar si se envia el body correcto
        if(endpointTarget.body != null){
            let siBody;
            if (Object.entries(body).length === 0) body = null;
            try {
                siBody = this.schemaResolver(body, endpointTarget.body);
            } catch (error) {
                throw new APIContractResolverError(APIContractResolverErrorCode.BAD_BODY_SPECIFICATION,
                    "La especificación de parametros body no está bien definida => " + error.message);
            }
            if(!siBody) throw new APIContractResolverError(APIContractResolverErrorCode.BODY_VARIABLES_REQUIRED,
                "Los parametros body no coinciden con los especificados en el contrato.");
        }

        //Hacer la llamada a la api
        
        console.log(method + " => " + path);
        try {
            switch (method) {
                case "get":
                    respuesta = await Axios.get(path);
                    break;
                case "post":
                    respuesta = await Axios.post(path, body);
                    break;
                case "put":
                    respuesta = await Axios.put(path, body);
                    break;
                case "patch":
                    respuesta = await Axios.patch(path, body);
                    break;
                case "delete":
                    respuesta = await Axios.delete(path);
                    break;
                default:
                    throw new Error("Método HTTP no soportado");
                    break;
            }
        } catch (error) {
            if(error.response){
                respuesta = new Object();
                respuesta.status = error.response.status;
                respuesta.data = error.response.data;
            }else if (error.request){
                throw new APIContractResolverError(APIContractResolverErrorCode.CALL_NO_RESPONSE_RECIVED,
                    "No se recibió respuesta a la llamada " + method.toUpperCase());
            }else{
                throw new APIContractResolverError(APIContractResolverErrorCode.CALL_ERROR,
                    error.message);
            }
        }
        let response =  new APIContractResolverResponse(
            respuesta.status,
            respuesta.data
        );
        respuesta = respuesta.data;

        //verificar si el resultado es el esperado
        let siRespuesta = false;
        let responseType = endpointTarget.responseType[response.code];
        if (responseType !== undefined){
            try {
                siRespuesta = this.schemaResolver(respuesta, responseType);
            } catch (error) {
                throw new APIContractResolverError(APIContractResolverErrorCode.BAD_RESPONSE_TYPE_SPECIFICATION,
                    "La especificacion de los parametros de respuesta no está bien definida => " + error.message);
            }
            if(!siRespuesta) throw new APIContractResolverError(APIContractResolverErrorCode.INVALID_RESPONSE_TYPE,
                "La respuesta dada no coincide con la esperada según el contrato.");


            //Obtener los datos según el mapeado del contrato
            let respuestaMapeada = null;
            let responseSchema = endpointTarget.responseSchemaMapper[response.code];
            if(responseSchema !== undefined){
                try {
                    //console.log(responseSchema);
                    respuestaMapeada = this.schemaMapper(respuestaMapeada, respuesta, responseSchema);
                } catch (error) {
                    throw new APIContractResolverError(APIContractResolverErrorCode.BAD_RESPONSE_MAPPER_SPECIFICATION,
                        "La especificacion del mapeo de la respuesta no está bien definida => " + error.message);
                }
                response.data = respuestaMapeada;
            }
            console.log("OK");
            
        }

        return response;
    }

    schemaResolver (obj, schema) {
        let siOpcional = schema.hasOwnProperty("optional") && schema.optional == true;

        if(!schema.hasOwnProperty("type")) throw new Error("Se debe de especificar la propiedad 'type'");
        if(siOpcional && obj == null) return true;
         
        if(schema.type == "number" && isNaN(obj)){
            console.log(`${obj} no es de tipo numerico`);
            return false;
        }

        if(schema.type == "string" && typeof obj !== "string") {
            console.log(`${obj} no es de tipo string`);
            return false;
        }

        if(schema.type == "object"){
            if(!obj instanceof Object) {
                console.log(`${obj} no es de tipo objeto`);
                return false;
            }
            if(!schema.hasOwnProperty("properties")) throw new Error("Se debe de especificar la propiedad 'properties'");

            for (const key in schema.properties) {
                let res = true;

                if(siOpcional) schema.properties[key].optional = true;

                if(!obj.hasOwnProperty(key)) {
                    if(!siOpcional){
                        console.log(`El objeto no tiene la propiedad ${key}`);
                        return false;
                    }
                }else{
                    res = this.schemaResolver(obj[key], schema.properties[key]);
                }
                
                if (!res) return false;
            }
        }

        if(schema.type == "array"){
            if(!(obj instanceof Array)) {
                console.log(`${obj} no es de tipo array`);
                return false;
            }
            if(!schema.hasOwnProperty("elements")) throw new Error("Se debe de especificar la propiedad 'elements'");
            obj.forEach(element => {
                let res = this.schemaResolver(element, schema.elements);
                if(!res) return false;
            });
        }

        return true;
    }

    schemaMapper (target, data, schemaMapper) {
        let siType = schemaMapper.hasOwnProperty("type");
        let siSource = schemaMapper.hasOwnProperty("source");
        let siProperties = schemaMapper.hasOwnProperty("properties");
        let siElements = schemaMapper.hasOwnProperty("elements");
        let direccion = null;

        if(siSource){
            let source = schemaMapper.source;

            if(source === "_base_") direccion = data;
            else{
                source = source.replace(/\s/g, "").split(".");
                source.forEach(dir => {
                    if (direccion == null) direccion = data[dir];
                    else direccion = direccion[dir];
                });
                if (direccion === undefined || direccion == null) throw new Error(`La ruta '${schemaMapper.source}' no existe`);
            }
        }

        if(siType && schemaMapper.type == "array"){

            if(!siSource) throw new Error("Se debe de especificar la propiedad 'source' en el array.");
            if(!siElements) throw new Error("Se debe de especificar la propiedad 'elements'");

            target = new Array();
            direccion.forEach(dir => {
                let element = null;
                element = this.schemaMapper(element, dir, schemaMapper.elements);
                target.push(element);
            });
            //console.log(target);

        }else if (siType && schemaMapper.type == "object"){

            if(!siProperties) throw new Error("Se debe de especificar la propiedad 'properties'");

            target = new Object();
            for (const key in schemaMapper.properties) {
                target[key] = null;
                if(siSource) schemaMapper.properties[key].source = schemaMapper.source + "." + schemaMapper.properties[key].source;
                // console.log(schemaMapper.properties[key]);
                // console.log("//////");
                target[key] = this.schemaMapper(target[key], data, schemaMapper.properties[key]);
            }

        }else if (!siType){
            if (!siSource) throw new Error("Se debe de especificar la propiedad 'source' a todos los parametros finales.");
            
            target = direccion;
        }

        return target;
    }
}

export {APIContractResolver, APIContract, Endpoint, APIContractResolverOptions};