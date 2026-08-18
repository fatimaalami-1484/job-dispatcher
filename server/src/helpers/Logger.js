const fs = require('fs');
const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger, transports, format } = require('winston');
const { logDir } = require('../config');

// Set directory for logs
let dir = logDir;
if (!dir) {
    dir = path.resolve('logs');
}

// Create logs directory if it doesn't exist
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Set up daily rotating file transports for combined logs and error logs
const dailyRotateFileCombined = new winston.transports.DailyRotateFile({
    level:            'silly',
    filename:         `${dir}/Combined-%DATE%.log`,
    datePattern:      'YYYY-MM-DD',
    zippedArchive:    true,
    handleExceptions: false,
    maxSize:          '100m',
    maxFiles:         '3d',
    format:           format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json()
    )
});

const dailyRotateFileError = new winston.transports.DailyRotateFile({
    level:            'error',
    filename:         `${dir}/Error-%DATE%.log`,
    datePattern:      'YYYY-MM-DD',
    zippedArchive:    true,
    handleExceptions: true,
    maxSize:          '100m',
    maxFiles:         '3d',
    format:           format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.prettyPrint()
    )
});

// Create logger with console, combined logs, and error logs as transports
const logger = createLogger({
    transports: [
        new transports.Console({
            level:            'silly',
            handleExceptions: false,
            format:           format.combine(
                format.errors({ stack: true }),
                format.timestamp(),
                format.printf((log) => `${log.timestamp} - ${log.level} - ${log.message} ${log.stack ? `\n${log.stack}\n` : ''}`)
            )
        }),
        dailyRotateFileError,
        dailyRotateFileCombined
    ],
    exitOnError: false
});

module.exports = logger;
