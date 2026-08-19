const AbstractModel = require('../../helpers/AbstractModel');

class JobsModel extends AbstractModel {
    static COLLECTION_NAME = 'jobs';

    static getResponseObject(doc, exclude = []) {
        const response = {
            id: doc.id,
            createdAt: doc.createdAt,
            finishedAt: doc.finishedAt,
            agentId: doc.agentId,
            fileName: doc.fileName,
            timeout: doc.timeout,
            status: doc.status
        };

        exclude.map((key) => delete response[key]);

        return response;
    }

    static getProjection(project = {}) {
        const projection = {
            _id: 0,
            id: 1,
            createdAt: 1,
            finishedAt: 1,
            agentId: 1,
            fileName: 1,
            timeout: 1,
            status: 1
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

    static getSortField({ sortId, orderBy }) {
        orderBy = [1, -1].includes(orderBy) ? orderBy : -1;
        return { createdAt: orderBy };
    }
}

module.exports = JobsModel;