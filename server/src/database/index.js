const mongodb = require('mongodb');
const Logger = require('../helpers/Logger');
const { database: db, } = require('../config');
const Enums = require('./enums');
const Statics = require('./statics');

class DB {
    static enums = Enums;
    static statics = Statics;
    static async connectMongoDB() {
        const mongodbConnectionOptions = {
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000
        };

        const client = new mongodb.MongoClient(db.mongodbURI, mongodbConnectionOptions);
        try {
            await client.connect();
            DB.mongodb = client.db(db.name);
            Logger.info(`Mongodb ${db.name} connected successfully to ${db.mongodbURI}`);
        } catch (err) {
            Logger.error(`Mongodb ${db.name} connection failed to ${db.mongodbURI}`);
            Logger.error({ message: err });
            process.exit(0);
        }
        client.on('error', (err) => {
            Logger.debug(`Mongodb ${db.name} connection error: ${err}`);
            process.exit(0);
        });
    }

    static async connect() {
        await this.connectMongoDB();
    }
}

module.exports = DB;
