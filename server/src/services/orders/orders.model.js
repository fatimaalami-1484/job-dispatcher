const AbstractModel = require('../../helpers/AbstractModel');
const uuid = require('uuid');
const database = require('../../database');

class OrdersModel extends AbstractModel {
    static COLLECTION_NAME = 'orders';

    constructor({
        id = uuid.v4(),
        jobId,
        status = database.enums.STATUS.INACTIVE,
        agentId,
        timeout,

    }) {
        super();
        this.id = id;
        this.jobId = jobId;
        this.status = status;
        this.agentId = agentId;
        this.timeout = timeout;

    }

    static getResponseObject(doc, exclude = []) {
        const response = {
            id: doc.id,
            jobId: doc.jobId,
            createdAt: doc.createdAt,
            startedAt: doc.startedAt,
            finishedAt: doc.finishedAt,
            duration: doc.duration,
            agentId: doc.agentId,
            timeout: doc.timeout,
            status: doc.status,
            result: doc.result
        };

        exclude.map((key) => delete response[key]);

        return response;
    }

    static getProjection(project = {}) {
        const projection = {
            _id: 0,
            id: 1,
            jobId: 1,
            createdAt: 1,
            startedAt: 1,
            finishedAt: 1,
            duration: 1,
            agentId: 1,
            timeout: 1,
            status: 1,
            result: 1
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

module.exports = OrdersModel;