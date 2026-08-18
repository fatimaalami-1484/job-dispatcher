import express from "express";
import { connect } from "nats";

const app = express();
const PORT = 3002;

const nc = await connect({
  servers: "nats://localhost:4222",
});

console.log("🟨 Agent 2 connected to NATS");

app.get("/", (_, res) => {
  res.send("Agent 2");
});

app.listen(PORT, () => {
  console.log(`Agent 2 running on ${PORT}`);
});