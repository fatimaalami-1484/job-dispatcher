const database = require('../database');

class AbstractModel {
    static COLLECTION_NAME = '';

    static async insertOne(doc) {
        doc.createdAt = new Date();
        doc.updatedAt = null;
        doc.deletedAt = null;

        await database.mongodb.collection(this.COLLECTION_NAME).insertOne(doc);
    }

    static async updateOne(filter, update) {
        filter.deletedAt = null;

        update.updatedAt = new Date();

        return await database.mongodb
            .collection(this.COLLECTION_NAME)
            .updateOne(filter, {
                $set: update
            });
    }

    static async findOne(filter, options = { projection: {} }) {
        filter.deletedAt = null;

        return await database.mongodb
            .collection(this.COLLECTION_NAME)
            .findOne(filter, { projection: options.projection });
    }

    static async find({
        filter = {},
        projection = {},
        select = {},
        sort = {},
        skip = 0,
        limit = 0
    }) {
        filter.deletedAt = null;

        projection = this.getSelect(select) ?? this.getProjection(projection);

        const totalItems = await database.mongodb
            .collection(this.COLLECTION_NAME)
            .countDocuments(filter);

        const items = await database.mongodb
            .collection(this.COLLECTION_NAME)
            .find(filter, { projection, sort, skip, limit })
            .toArray();

        return { totalItems, items };
    }

    static getProjection(project = {}) {
        const projection = { _id: 0 };

        for (const [key, value] of Object.entries(project)) {
            if (value === 1) projection[key] = 1;
        }

        return projection;
    }

    static getSelect(select = {}) {
        if (Object.keys(select).length === 0) return null;

        const projection = { _id: 0 };

        for (const [key, value] of Object.entries(select)) {
            if (value) projection[key] = value;
        }

        return projection;
    }
}

module.exports = AbstractModel;