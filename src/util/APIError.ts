import httpStatus from "http-status";

export default class APIError extends Error {
    status: number = httpStatus.INTERNAL_SERVER_ERROR;
    constructor(statusCode: number, message: string|string[]='') {
        super(typeof message === 'string'?message:message.join(','));
        this.status = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
