import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import APIError from "../util/APIError";
import server_logger from "../config/server_logger";

const convertUnhandledError: ErrorRequestHandler = (err, req, res, next) => {
    if (!(err instanceof APIError)) {
        let statusCode: number, message: string;
        if (err.name === 'ValidationError') {
            statusCode = httpStatus.BAD_REQUEST;
            message = err.message || '';
        } else {
            statusCode = httpStatus.INTERNAL_SERVER_ERROR;
            message = err.message || httpStatus[statusCode].toString();
        }

        next(new APIError(statusCode, message))
    } else {
        next(err);
    }
}

const handleError: ErrorRequestHandler = (err, req, res, next) => {
    let statusCode = (err instanceof APIError) ? err.status : httpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || '';

    const response = {
        status: statusCode,
        ...(process.env.NODE_ENV == 'production' ? {} : { message: message, stacktrace: err.stack || '' }),
    };

    server_logger.error(err);
    res.status(statusCode).send(response);
}

export { convertUnhandledError, handleError };
