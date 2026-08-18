import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (_, res) => {
  res.send("Central Service");
});

app.listen(PORT, () => {
  console.log(`Central Service running on ${PORT}`);
});