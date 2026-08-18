const path = require('path');

const rootDir = __dirname.replace('\\server\\src', '');
require('dotenv').config({
    path:     path.join(rootDir, '.env'),
    override: true
});

const cors = require('cors');
const { corsOptions } = require('./config');
const morgan = require('morgan');
const express = require('express');
const Logger = require('./helpers/Logger');



process.on('uncaughtException', (err) => {
    Logger.error({ message: err });
});

const app = express();

// Stream morgan logs to winston logger
Logger.stream = {
    write (message) {
        Logger.debug(message);
    }
};

// Use middleware for logging HTTP requests
app.use(
    morgan(
        '":method :url HTTP/:http-version" :status - ⌛ :response-time ms - ":referrer" ":user-agent"',
        { stream: Logger.stream }
    )
);

// Parse JSON and URL-encoded request bodies and cookies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
    limit:    '50mb',
    extended: true
}));

// Enable CORS for all routes
app.use(cors(corsOptions));

// Health checker
app.get('/health', (req, res) => {
    res.status(200).send(Tools.successResponseGenerator('سرویس در حال اجرا می‌باشد'));
});


// Handle 404 errors
app.use('/api/*', (req, res, next) => next(new NotFoundError('مسیر یافت نشد')));

// Handle errors
app.use(ErrorHandlerMiddleware);

module.exports = app;