class HttpError extends Error {
    constructor(message, code, data) {
        super(message);
        this.code = code || 500;
        this.data = data || null;
    }
}

module.exports = HttpError;