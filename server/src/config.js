const logDir = process.env.LOG_DIR;

const port = process.env.PORT;
const environment = process.env.NODE_ENV;

const corsOptions = {
    origin: (process.env.ORIGIN || 'http://localhost:3000,http://localhost:5000').split(','),
    credentials: process.env.CREDENTIALS === 'false',  //Cookie
    preflightContinue: process.env.PREFLIGHT === 'true'  //Browser option 
};

const database = {
    name: environment === 'production' ? process.env.MONGODB_DATABASE : process.env.MONGODB_DATABASE_STAGE,
    port: process.env.MONGODB_PORT,
    mongodbURI: process.env.MONGODB_URI,
};

module.exports = {
    port,
    logDir,
    database,
    environment,
    corsOptions
};