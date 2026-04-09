import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import StartPortal from "./StartPortal";

const ORANGE = "#E8732A";

const styles = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f7f7f7",
    fontFamily: "'DM Sans', sans-serif",
  },
  box: {
    background: "#fff",
    borderRadius: 12,
    padding: 40,
    width: 360,
    boxShadow: "0 2px 16px rgba(0,0,0,.08)",
    textAlign: "center",
  },
  header: {
    background: ORANGE,
    borderRadius: "12px 12px 0 0",
    margin: "-40px -40px 24px",
    padding: "20px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    height: 48,
    borderRadius: 8,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #ececec",
    borderRadius: 8,
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    marginBottom: 12,
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    background: ORANGE,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 24px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 8,
  },
  error: { color: "#c0392b", fontSize: 13, marginTop: 8 },
  sub: { marginBottom: 18, fontSize: 15, color: "#666" },
};

function LoginGate({ children }) {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("gc_authenticated") === "true"
  );
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (authed) return children;

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          sessionStorage.setItem("gc_authenticated", "true");
          setAuthed(true);
        } else {
          setErr(data.error || "Ongeldig wachtwoord");
        }
        setLoading(false);
      })
      .catch(() => {
        setErr("Verbinding mislukt");
        setLoading(false);
      });
  };

  return (
    <div style={styles.wrap}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <form style={styles.box} onSubmit={submit}>
        <div style={styles.header}>
          <img src="/logo.jfif" alt="GeriCall" style={styles.headerLogo} />
        </div>
        <div style={styles.sub}>Verzorgend Portaal</div>
        <input
          type="password"
          placeholder="Wachtwoord"
          style={styles.input}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
        />
        {err && <div style={styles.error}>{err}</div>}
        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? "Even wachten…" : "Inloggen"}
        </button>
      </form>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoginGate>
      <StartPortal />
    </LoginGate>
  </React.StrictMode>
);
