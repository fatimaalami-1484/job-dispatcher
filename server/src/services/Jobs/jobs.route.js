const router = require('express').Router();

const JobsController = require('./jobs.controller');

router.post(
    '/jobs', 
    JobsController.createJob
);


router.get(
    '/jobs/:id', 
    JobsController.getJobById
);

module.exports = router;