import https from 'https';
import http from 'http';
import express, { Express, Request, Response, NextFunction } from 'express';
import httpStatus from "http-status";
import helmet from "helmet";
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { readFileSync } from "fs";

// Load server config
import { loadServerEnvironment } from "./config/env";
loadServerEnvironment();

import { CERT_PATH } from "./config/path";
import server_logger from "./config/server_logger";
import { infoLogHandler, errorLogHandler } from './config/express_logger';
import { convertUnhandledError, handleError } from "./middleware/error";

// Load after config is configured.
import data_source from './data_source';
import V1Router from './route/v1';
import DebugRouter from './route/debug';
import PageRouter from './route/page';

// Load preset(s)
const tls_options = process.env.ENABLE_TLS === 'tls'
    ?{
        key: readFileSync(path.join(CERT_PATH, 'localhost-key.pem')),
        cert: readFileSync(path.join(CERT_PATH, 'localhost.pem')),
    }
    : null;
const SERVER_PORT = parseInt(process.env.SERVER_PORT as string);

// Initialize server instance
const app: Express = express();

// Add request logger
app.use(infoLogHandler);
app.use(errorLogHandler);
// Header sanitizer
app.use(helmet());
// Parse application/x-www-form-urlencoded
app.use(express.json());
// Parse application/json
app.use(express.urlencoded({ extended: true }));
// Compress response body
app.use(compression());
// Cors
app.use(cors());

// Main routers
app.use(V1Router);
app.use(PageRouter);
if (process.env.NODE_ENV !== 'production')
    app.use(DebugRouter);
app.use((req: Request, res: Response, next: NextFunction) => res.sendStatus(httpStatus.NOT_FOUND));

// Convert plain error into APIError
app.use(convertUnhandledError);
// Send handled error response
app.use(handleError);

data_source.initialize()
    .then(ds => {
        server_logger.info(`Database is successfully initialized.`)
    })
    .catch(err => {
        server_logger.error(err);
    });

if (tls_options) {
    const server = https.createServer(tls_options, app);
    server.listen({ port: 443 }, () => {
        server_logger.info(`Server is running on port ${SERVER_PORT} with HTTPS...`);
    });
} else {
    const server = http.createServer(app);
    server.listen({ port: 8000 }, () => {
        server_logger.info(`Server is running on port ${SERVER_PORT} with HTTP...`);
        server_logger.warn(`The server is running on HTTP without any TLS configuration.`
        + `If it is not a dev server, please check if you can use TLS via .env file configuration.`)
    });
}
