const logDir = process.env.LOG_DIR;

const corsOptions = {
    origin: (process.env.ORIGIN || 'http://localhost:3000,http://localhost:5000').split(','),
    credentials: process.env.CREDENTIALS === 'false',  //Cookie
    preflightContinue: process.env.PREFLIGHT === 'true'  //Browser option 
};

module.exports = {
    logDir,
    corsOptions
}