const router = require('express').Router();
const OrdersController = require('./orders.controller');
const SchemaValidatorMiddleware = require('../../middlewares/SchemaValidatorMiddleware');
const { createOrderSchema } = require('./orders.schema')
router.post(
    '/orders',
    SchemaValidatorMiddleware(createOrderSchema),
    OrdersController.createOrder
);

router.get(
    '/orders',
    OrdersController.getOrders
);

router.get(
    '/orders/:orderId',
    OrdersController.getOrder
);

module.exports = router;