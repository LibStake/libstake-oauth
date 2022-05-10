// Winston server server_logger define
import winston from "winston";

// Configure server_logger transport
let transport = [];
transport.push(new winston.transports.Console({
    stderrLevels: ['error'],
}));
transport.push(new winston.transports.File({
    filename: 'server.log',
    level: 'info',
}));
transport.push(new winston.transports.File({
    filename: 'error.log',
    level: 'error',
}));

// Create server_logger
const server_logger = winston.createLogger({
    // Logging level error(0)~warn(1)~info(2)~http(3)~verbose(4)~debug(5)~silly(6)
    level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
    format: winston.format.combine(
        // No colors in prod for performance
        (process.env.NODE_ENV !== 'production') ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.printf(({ level, message }) => `${new Date().toISOString()} :: ${level}:: ${message}`)
    ),
    defaultMeta: { service: 'user-service' },
    transports: transport,
    // If true, all logs are suppressed
    silent: false,
});

export default server_logger;
