import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INITIAL_PATH = join(__dirname, "_initial-config.json");
const TMP_PATH = "/tmp/backlog-config.json";

function loadConfig() {
  if (existsSync(TMP_PATH)) {
    return JSON.parse(readFileSync(TMP_PATH, "utf-8"));
  }
  return JSON.parse(readFileSync(INITIAL_PATH, "utf-8"));
}

function saveConfig(config) {
  writeFileSync(TMP_PATH, JSON.stringify(config, null, 2));
}

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.json(loadConfig());
  }

  if (req.method === "POST") {
    const config = req.body;
    saveConfig(config);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
