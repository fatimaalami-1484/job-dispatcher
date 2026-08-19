const {
    connect,
    StringCodec,
    AckPolicy,
    DeliverPolicy
} = require('nats');

const OrdersModel = require('../orders/orders.model');
const database = require('../../database');

let nc;
let js;
let jsm;

const sc = StringCodec();


// Process Job Result
const processJobResult = async (msg, agentId) => {
    try {
        const result = JSON.parse(
            sc.decode(msg.data)
        );

        console.log(`Received Job Result from ${agentId}:`);

        console.log(result);

        const updateResult =
            await OrdersModel.updateOne(
                { id: result.orderId },
                {
                    $set: {
                        status: result.status,
                        startedAt: result.startedAt,
                        finishedAt: result.finishedAt,
                        duration: result.duration,
                        result: result.result
                    }
                }
            );

        console.log(
            'MongoDB update result:',
            updateResult
        );

        if (updateResult.matchedCount === 0) {
            console.log(`Order ${result.orderId} was NOT found in MongoDB`);

        } else {
            console.log(`Order ${result.orderId} updated successfully`);
        }

        msg.ack();

    } catch (err) {
        console.error(
            `Failed to process ${agentId} job result:`,
            err
        );
        msg.ack();
    }
};

// Create Result Consumer
const createResultConsumer = async (
    streamName,
    durableName,
    filterSubject,
    agentId
) => {

    try {
        await jsm.consumers.add(
            streamName,
            {
                durable_name: durableName,
                filter_subject: filterSubject,
                ack_policy: AckPolicy.Explicit,
                deliver_policy: DeliverPolicy.New
            }
        );
        console.log(`${agentId} results consumer created`);

    } catch (err) {
        console.log(`${agentId} results consumer already exists`);
    }

    const consumer =
        await js.consumers.get(
            streamName,
            durableName
        );

    const messages =
        await consumer.consume();

    (async () => {
        for await (const msg of messages) {
            await processJobResult(
                msg,
                agentId
            );
        }
    })();
};

// Create Job Status Consumer
const createJobStatusConsumer = async () => {
    try {
        await jsm.consumers.add(
            'JOB_STATUS',
            {
                durable_name: 'central-job-status',
                ack_policy: AckPolicy.Explicit,
                deliver_policy: DeliverPolicy.New
            }
        );
        console.log('Job status consumer created');

    } catch (err) {
        console.log('Job status consumer already exists');
    }

    const statusConsumer =
        await js.consumers.get(
            'JOB_STATUS',
            'central-job-status'
        );

    const statusMessages =
        await statusConsumer.consume();

    (async () => {
        for await (const msg of statusMessages) {
            try {
                const statusUpdate =
                    JSON.parse(
                        sc.decode(msg.data)
                    );

                console.log('Received Job Status:');
                console.log(statusUpdate);

                const updateResult =
                    await OrdersModel.updateOne(
                        {
                            id: statusUpdate.orderId,
                            status: database.enums.STATUS.PENDING
                        },
                        {
                            $set: {
                                status: statusUpdate.status
                            }
                        }
                    );

                console.log(
                    'Job status update result:',
                    updateResult
                );

                if (
                    updateResult.matchedCount === 0
                ) {
                    console.log(`Order ${statusUpdate.orderId} was NOT found in MongoDB`);

                } else {
                    console.log(`Order ${statusUpdate.orderId} status updated to ${statusUpdate.status}`);
                }
                msg.ack();

            } catch (err) {
                console.error(
                    'Failed to process job status:',
                    err
                );
                msg.ack();
            }
        }
    })();
};

// Create HELLO Consumer
const createHelloConsumer = async () => {
    try {
        await jsm.consumers.add(
            'HELLO',
            {
                durable_name: 'central',
                filter_subject: 'hello.central',
                ack_policy: AckPolicy.Explicit,
                deliver_policy: DeliverPolicy.All
            }
        );
        console.log('Hello consumer created');

    } catch {
        console.log('Hello consumer already exists');
    }

    const helloConsumer =
        await js.consumers.get(
            'HELLO',
            'central'
        );

    const helloMessages =
        await helloConsumer.consume();
    (async () => {
        for await (const msg of helloMessages) {
            console.log(
                `Central heard: ${sc.decode(msg.data)}`
            );
            msg.ack();
        }
    })();
};

// Create Order Received Consumer
const createOrderReceivedConsumer = async () => {

    try {

        await jsm.consumers.add(
            'ORDERS',
            {
                durable_name: 'central-orders-received',
                filter_subject: 'orders.received',
                ack_policy: AckPolicy.Explicit,
                deliver_policy: DeliverPolicy.New
            }
        );

        console.log(
            'Order received consumer created'
        );

    } catch (err) {

        console.log(
            'Order received consumer already exists'
        );

    }


    const consumer =
        await js.consumers.get(
            'ORDERS',
            'central-orders-received'
        );


    const messages =
        await consumer.consume();


    (async () => {

        for await (const msg of messages) {

            try {

                const orderReceived =
                    JSON.parse(
                        sc.decode(msg.data)
                    );


                console.log(
                    'Order received by Agent:'
                );

                console.log(
                    orderReceived
                );


                const updateResult =
                    await OrdersModel.updateOne(
                        {
                            id:orderReceived.orderId,
                            status: database.enums.STATUS.INACTIVE
                        },
                        {
                            $set: {
                                status: database.enums.STATUS.PENDING
                            }
                        }
                    );


                console.log(
                    'Order PENDING update:',
                    updateResult
                );


                if (
                    updateResult.matchedCount === 0
                ) {

                    console.log(
                        `Order ${orderReceived.orderId} was NOT found or is not INACTIVE`
                    );

                } else {

                    console.log(
                        `Order ${orderReceived.orderId} status changed to PENDING`
                    );

                }


                msg.ack();

            } catch (err) {

                console.error(
                    'Failed to process order received:',
                    err
                );

                msg.ack();

            }

        }

    })();

};

const createOrderRunningConsumer = async () => {

    try {

        await jsm.consumers.add(
            'ORDERS',
            {
                durable_name: 'central-orders-running',
                filter_subject: 'orders.running',
                ack_policy: AckPolicy.Explicit,
                deliver_policy: DeliverPolicy.New
            }
        );

        console.log(
            'Order running consumer created'
        );

    } catch (err) {

        console.log(
            'Order running consumer already exists'
        );

    }


    const consumer =
        await js.consumers.get(
            'ORDERS',
            'central-orders-running'
        );


    const messages =
        await consumer.consume();


    (async () => {

        for await (const msg of messages) {

            try {

                const statusUpdate =
                    JSON.parse(
                        sc.decode(msg.data)
                    );


                console.log(
                    'Received RUNNING status:'
                );

                console.log(
                    statusUpdate
                );


                const updateResult =
                    await OrdersModel.updateOne(
                        {
                            id:statusUpdate.orderId,

                            status: database.enums.STATUS.PENDING
                        },
                        {
                            $set: {
                                status:
                                    database.enums.STATUS.RUNNING
                            }
                        }
                    );


                console.log(
                    'RUNNING update result:',
                    updateResult
                );


                if (
                    updateResult.matchedCount === 0
                ) {

                    console.log(
                        `Order ${statusUpdate.orderId} was NOT found or is not PENDING`
                    );

                } else {

                    console.log(
                        `Order ${statusUpdate.orderId} status changed to RUNNING`
                    );

                }


                msg.ack();

            } catch (err) {

                console.error(
                    'Failed to process RUNNING status:',
                    err
                );

                msg.ack();

            }

        }

    })();

};

// Connect Central to NATS
const connectNats = async () => {

    try {

        nc = await connect({
            servers: 'nats://localhost:4222'
        });

        js = nc.jetstream();
        jsm = await nc.jetstreamManager();
        console.log('Central connected to NATS');

        // // JOB STATUS
        // await createJobStatusConsumer();

        // ORDER RECEIVED
        await createOrderReceivedConsumer();

        // ORDER RUNNING
        await createOrderRunningConsumer();

        // HELLO
        await createHelloConsumer();

        // AGENT 1 RESULTS
        await createResultConsumer(
            'ORDERS',
            'central-orders-result-agent-1',
            'orders.result.agent-1',
            'Agent 1'
        );

        // AGENT 2 RESULTS
        await createResultConsumer(
            'ORDERS',
            'central-orders-result-agent-2',
            'orders.result.agent-2',
            'Agent 2'
        );

        // Send Hello to Agent 1
        await js.publish(
            'hello.agent-1',
            sc.encode(
                'Hello Agent 1'
            )
        );

        console.log('Hello message sent to Agent 1');

        // Send Hello to Agent 2

        await js.publish(
            'hello.agent-2',
            sc.encode(
                'Hello Agent 2'
            )
        );

        console.log('Hello message sent to Agent 2');

    } catch (err) {
        console.error(
            'Central NATS connection error:',
            err
        );
        throw err;
    }
};

// Publish Message
const publish = async (
    subject,
    data
) => {
    if (!js) {
        throw new Error(
            'NATS is not connected'
        );
    }

    await js.publish(
        subject,
        sc.encode(
            JSON.stringify(data)
        )
    );

};

// Export

module.exports = {
    connectNats,
    publish
};