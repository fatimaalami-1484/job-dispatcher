const { randomUUID } = require('crypto');
const JobsModel = require('./jobs.model');

const createJob = async (context) => {
    const { body } = context;

    if (!body.agentId || !body.fileName || body.timeout == null) {
        throw new Error('اطلاعات جاب ناقص است');
    }

    if (typeof body.timeout !== 'number' || body.timeout <= 0) {
        throw new Error('timeout نامعتبر است');
    }

    const job = {
        id: randomUUID(),
        finishedAt: null,
        agentId: body.agentId,
        fileName: body.fileName,
        timeout: body.timeout,
        status: 'PENDING'
    };

    await JobsModel.insertOne(job);

    return {
        message: 'جاب با موفقیت ایجاد شد',
        data: JobsModel.getResponseObject(job)
    };
};

module.exports = {
    createJob
};