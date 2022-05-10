// Morgan express logger define
import morgan from 'morgan';
import logger from './server_logger';

// Log plain requests
const infoLogHandler = morgan(process.env.NODE_ENV == 'production' ? 'combined' : 'dev', {
    immediate: false,
    skip: (req, res) => res.statusCode >= 400,
    stream: {
        write: msg => logger.info(msg.trim())
    }
});

// Log request errors
const errorLogHandler = morgan(process.env.NODE_ENV == 'production' ? 'combined' : 'dev', {
    immediate: false,
    skip: (req, res) => res.statusCode < 400,
    stream: {
        write: msg => logger.error(msg.trim()),
    }
});

export {
    infoLogHandler,
    errorLogHandler,
};
