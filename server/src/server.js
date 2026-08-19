const app = require('./app');
const Logger = require('./helpers/Logger');
const { port, environment } = require('./config');
const database = require('./database');

// Connect to MongoDB, Redis and load static data
database.connect().then(() => {
    app.listen(port, () => {
        Logger.info(`${environment} server running on port: ${port}`);
    }).on('error', (err) => {
        Logger.error(`An error occurred while ${environment} server running on port: ${port}\n${err}`);
        process.exit(1);
    });
}).catch((err) => {
    Logger.debug(`Database connection error: ${err}`);
    process.exit(1);
});
