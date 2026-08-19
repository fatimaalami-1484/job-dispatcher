const OrdersModel = require('./orders.model');
const JobsModel = require('../jobs/jobs.model');
const { NotFoundError } = require('../../helpers/APIErros');
const NatsService = require('../Nats/nats.service');

// Create a new order
const createOrder = async (context) => {
    const { order } = context.body;

    // Find Job
    const job = await JobsModel.findOne({ id: order.jobId });

    if (!job) {
        throw new NotFoundError('جاب مورد نظر یافت نشد');
    }

    // Save the order in MongoDB
    await OrdersModel.insertOne(order);

    // Publish the order to the target agent
    const subject = `orders.${order.agentId}`;

    await NatsService.publish(subject, {
        orderId: order.id,
        jobId: order.jobId,
        agentId: order.agentId,
        address: job.address,
        timeout: order.timeout
    });

    return {
        message: 'سفارش با موفقیت ایجاد شد',
        data: OrdersModel.getResponseObject(order)
    };
};

// Get available orders
const getOrders = async () => {
    const { items: orders, totalItems } = await OrdersModel.find({ filter: {} });

    return {
        message: 'دریافت اطلاعات سفارش ها با موفقیت انجام شد',
        data: {
            orders,
            totalItems: totalItems
        }
    };
};


// Get order information
const getOrder = async (context) => {
    const { orderId } = context;

    const order = await OrdersModel.findOne(
        { id: orderId },
    );

    if (!order) {
        throw new NotFoundError('سفارش یافت نشد');
    }

    return {
        message: 'دریافت اطلاعات سفارش با موفقیت انجام شد',
        data: {
            order: OrdersModel.getResponseObject(order)
        }
    };
};

module.exports = {
    getOrder,
    getOrders,
    createOrder,
};