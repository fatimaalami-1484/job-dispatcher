import express from "express";
import { connect } from "nats";

const app = express();
const PORT = 3001;

const nc = await connect({
  servers: "nats://localhost:4222",
});

console.log("🟩 Agent 1 connected to NATS");

app.get("/", (_, res) => {
  res.send("Agent 1");
});

app.listen(PORT, () => {
  console.log(`Agent 1 running on ${PORT}`);
});