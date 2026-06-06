import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Vercel");
});

export default function handler(req, res) {
  return app(req, res);
}
