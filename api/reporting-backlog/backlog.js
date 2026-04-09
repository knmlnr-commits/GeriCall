import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INITIAL_PATH = join(__dirname, "_initial-data.json");
const TMP_PATH = "/tmp/backlog.json";

function loadItems() {
  if (existsSync(TMP_PATH)) {
    return JSON.parse(readFileSync(TMP_PATH, "utf-8"));
  }
  return JSON.parse(readFileSync(INITIAL_PATH, "utf-8"));
}

function saveItems(items) {
  writeFileSync(TMP_PATH, JSON.stringify(items, null, 2));
}

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.json(loadItems());
  }

  if (req.method === "POST") {
    const { items } = req.body;
    saveItems(items);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
