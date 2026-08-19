const Tools = require('../../helpers/Tools');
const OrdersLogic = require('./orders.logic');
const OrdersModel = require('./orders.model');

const createOrder = async (req, res, next) => {
    try {
        const context = {
            body: { order: new OrdersModel(req.body) }
        };

        const { data, message } = await OrdersLogic.createOrder(context);

        res.status(201).send(Tools.successResponseGenerator(message, data));
    } catch (err) {
        return next(err);
    }
};


const getOrders = async (req, res, next) => {
    try {
        const { data, message } = await OrdersLogic.getOrders(context);

        res.status(200).send(Tools.successResponseGenerator(message, data));
    } catch (err) {
        return next(err);
    }
};

const getOrder = async (req, res, next) => {
    try {
        const context = {
            params: {
                orderId: req.params.orderId
            }
        };

        const { data, message } = await OrdersLogic.getOrder(context);

        res.status(200).send(Tools.successResponseGenerator(message, data));
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    getOrder,
    getOrders,
    createOrder,
};