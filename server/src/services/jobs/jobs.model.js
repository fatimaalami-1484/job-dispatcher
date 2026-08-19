const AbstractModel = require('../../helpers/AbstractModel');
const uuid = require('uuid');
const database = require('../../database');

class JobsModel extends AbstractModel {
    static COLLECTION_NAME = 'jobs';

    constructor({

    }) { }

    static getResponseObject(doc, exclude = []) {
        const response = {
            id: doc.id,
            name: doc.name,
            address: doc.address,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            deletedAt: doc.deletedAt,
            description: doc.description
        }

        exclude.map((key) => delete response[key]);

        return response;
    }

    static getProjection(project = {}) {
        const projection = {
            _id: 0,
            id: 1,
            name: 1,
            address: 1,
            createdAt: 1,
            updatedAt: 1,
            deletedAt: 1,
            description: 1
        };

        for (const [key, value] of Object.entries(project)) {
            if (value === 1) {
                projection[key] = 1;
            } else {
                delete projection[key];
            }
        }

        return projection;
    }
}

module.exports = JobsModel;