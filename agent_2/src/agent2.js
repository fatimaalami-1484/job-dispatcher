const express = require('express');
const {
    connect,
    StringCodec,
    AckPolicy,
    DeliverPolicy
} = require('nats');

const app = express();
const PORT = 3002;

// Start the agent
const startAgent = async () => {
    const nc = await connect({
        servers: 'nats://localhost:4222'
    });

    const sc = StringCodec();
    const js = nc.jetstream();
    const jsm = await nc.jetstreamManager();

    console.log('Agent 2 connected to NATS');

    // Create the durable consumer
    try {
        await jsm.consumers.add('HELLO', {
            durable_name: 'agent-2',
            filter_subject: 'hello.agent-2',
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.New
        });
    } catch (err) {
        console.log('Consumer already exists:', err.message);
    }

    // Listen for Hello messages
    const consumer = await js.consumers.get('HELLO', 'agent-2');
    const messages = await consumer.consume();

    (async () => {
        for await (const msg of messages) {
            const text = sc.decode(msg.data);

            console.log(`Received from Central: ${text}`);

            await js.publish(
                'hello.central',
                sc.encode('Hello Central Service, I am Agent 2.')
            );

            console.log('Agent 2: "Hello Central Service, I am Agent 2."');

            msg.ack();
        }
    })();

    app.get('/', (_, res) => {
        res.send('Agent 2');
    });

    app.listen(PORT, () => {
        console.log(`Agent 2 is running on port ${PORT}`);
    });
};

startAgent().catch((err) => {
    console.error('Agent 2 failed to start:', err);
    process.exit(1);
});