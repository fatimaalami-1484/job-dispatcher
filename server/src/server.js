const app = require('./app');
const Logger = require('./helpers/Logger');
const { port, environment } = require('./config');
const database = require('./database');
const NatsService = require('./services/Nats/nats.service');

// Connect to MongoDB first, then connect to NATS and start the server
database.connect()
    .then(async () => {
        await NatsService.connectNats();

        app.listen(port, () => {
            Logger.info(`${environment} server running on port: ${port}`);
        }).on('error', (err) => {
            Logger.error(`An error occurred while ${environment} server running on port: ${port}\n${err}`);
            process.exit(1);
        });
    })
    .catch((err) => {
        Logger.debug(`Database connection error: ${err}`);
        process.exit(1);
    });