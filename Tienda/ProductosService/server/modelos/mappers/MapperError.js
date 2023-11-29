class MapperErrorCode {
    static EMPTY_NULL_UNDEFINED_OBJECT = 100;
    static UNKNOWN_OBJECT = 101;
}

class MapperError extends Error {
    constructor(code, message){
        super(message);
        this.code = code;
    }
}

export {MapperErrorCode, MapperError};