import express from "express";
import {
  connect,
  StringCodec,
  AckPolicy,
  DeliverPolicy,
} from "nats";

const app = express();
const PORT = 3000;

const nc = await connect({
  servers: "nats://localhost:4222",
});

const sc = StringCodec();
const js = nc.jetstream();
const jsm = await nc.jetstreamManager();

console.log("Central Service connected to NATS");

// Create durable consumer for replies
try {
  await jsm.consumers.add("HELLO", {
    durable_name: "central",
    filter_subject: "hello.central",
    ack_policy: AckPolicy.Explicit,
    deliver_policy: DeliverPolicy.All,
  });
} catch {}

// Listen for replies from agents
const consumer = await js.consumers.get("HELLO", "central");
const messages = await consumer.consume();

(async () => {
  for await (const msg of messages) {
    console.log(`Central heard: ${sc.decode(msg.data)}`);
    msg.ack();
  }
})();

app.get("/", (_, res) => {
  res.send("Central Service");
});

// Send Hello messages when Central starts
app.listen(PORT, async () => {
  console.log(`Central Service is running on port ${PORT}`);

  await js.publish(
    "hello.agent-1",
    sc.encode("Hello Agent 1")
  );
  console.log("Hello stored for Agent 1");

  await js.publish(
    "hello.agent-2",
    sc.encode("Hello Agent 2")
  );
  console.log("Hello stored for Agent 2");
});