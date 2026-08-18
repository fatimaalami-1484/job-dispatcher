import express from "express";
import { connect, StringCodec } from "nats";

const app = express();
const PORT = 3001;

const nc = await connect({
  servers: "nats://localhost:4222",
});

const sc = StringCodec();

console.log("Agent 1 connected to NATS");

// Listen for messages addressed to Agent 1
const sub = nc.subscribe("hello.agent1");

(async () => {
  for await (const msg of sub) {
    const text = sc.decode(msg.data);

    console.log(`Received from Central: ${text}`);

    // Introduce Agent 1 to Central
    nc.publish(
      "hello.central",
      sc.encode("Hello Central Service, I am Agent 1.")
    );

    console.log('Agent 1: "Hello Central Service, I am Agent 1."');
  }
})();

app.get("/", (_, res) => {
  res.send("Agent 1");
});

app.listen(PORT, () => {
  console.log(`Agent 1 is running on port ${PORT}`);
});