import express from "express";
import {
  connect,
  StringCodec,
  AckPolicy,
  DeliverPolicy,
} from "nats";

const app = express();
const PORT = 3002;

const nc = await connect({
  servers: "nats://localhost:4222",
});

const sc = StringCodec();
const js = nc.jetstream();
const jsm = await nc.jetstreamManager();

console.log("Agent 2 connected to NATS");

// Create durable consumer
try {
  await jsm.consumers.add("JOBS", {
    durable_name: "agent-2",
    filter_subject: "hello.agent-2",
    ack_policy: AckPolicy.Explicit,
    deliver_policy: DeliverPolicy.All,
  });
} catch {}

// Consume messages from JetStream
const consumer = await js.consumers.get("JOBS", "agent-2");
const messages = await consumer.consume();

(async () => {
  for await (const msg of messages) {
    const text = sc.decode(msg.data);

    console.log(`Received from Central: ${text}`);

    await js.publish(
      "hello.central",
      sc.encode("Hello Central Service, I am Agent 2.")
    );

    console.log("Reply sent to Central Service.");

    msg.ack();
  }
})();

app.get("/", (_, res) => {
  res.send("Agent 2");
});

app.listen(PORT, () => {
  console.log(`Agent 2 is running on port ${PORT}`);
});