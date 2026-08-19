const router = require('express').Router();
const JobsRoutes = require('./jobs/jobs.route');
const OrdersRoutes = require('./orders/orders.route');



router.use(JobsRoutes);
router.use(OrdersRoutes);

module.exports = router;
