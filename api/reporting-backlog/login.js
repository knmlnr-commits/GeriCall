export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body;

  if (password === "GC2026!") {
    return res.json({ ok: true });
  }

  res.json({ ok: false, error: "Ongeldig wachtwoord" });
}
