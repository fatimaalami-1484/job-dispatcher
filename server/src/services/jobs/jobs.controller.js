const Tools = require('../../helpers/Tools');
const JobsLogic = require('./jobs.logic');

const getJobs = async (req, res, next) => {
    try {
        const { data, message } = await JobsLogic.getJobs();
        res.status(200).send(Tools.successResponseGenerator(message, data ));
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    getJobs,
};