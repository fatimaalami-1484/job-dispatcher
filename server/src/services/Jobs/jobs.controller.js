const Tools = require('../../helpers/Tools');
const JobsLogic = require('./jobs.logic');

const createJob = async (req, res, next) => {
    try {
        const context = { body: req.body };

        const { data, message } = await JobsLogic.createJob(context);

        res.status(201).send(Tools.successResponseGenerator(message, data));
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    createJob
};