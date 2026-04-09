const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3456;
const BACKLOG_PATH = path.join(__dirname, "data", "backlog.json");

app.use(cors());
app.use(express.json());

app.get("/api/backlog", (req, res) => {
  const data = JSON.parse(fs.readFileSync(BACKLOG_PATH, "utf-8"));
  res.json(data);
});

app.post("/api/backlog", (req, res) => {
  const { items } = req.body;
  fs.writeFileSync(BACKLOG_PATH, JSON.stringify(items, null, 2));
  res.json({ ok: true });
});

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === "GC2026!") {
    res.json({ ok: true });
  } else {
    res.json({ ok: false, error: "Ongeldig wachtwoord" });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`GeriCall Backlog server draait op http://localhost:${PORT}`);
});
