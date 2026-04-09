const { useState, useEffect, useRef, useCallback } = React;

/* ── constants ── */
const ORANGE = "#E8732A";
const LANES = ["Ad hoc", "Onderhoud", "Dashboards", "Analyses", "Voorspellend", "Overig"];
const STATUSES = ["Backlog", "In analyse", "In uitvoering", "Gereed"];
const PRIOS = ["Hoog", "Midden", "Laag"];
const OWNERS = ["", "Koen", "René", "Laurina", "Jeff", "Niels", "Raymond", "Tobias", "Rosalie", "Allard", "Famke"];
const IMPACTS = ["XS", "S", "M", "L", "XL"];
const DATA_OPTS = ["Ja", "Deels", "Nee"];

const LANE_COLORS = {
  "Ad hoc": "#E8732A",
  "Onderhoud": "#888",
  "Dashboards": "#3B82F6",
  "Analyses": "#10B981",
  "Voorspellend": "#8B5CF6",
  "Overig": "#666",
};

/* ── badge colors ── */
function prioBg(v) {
  if (v === "Hoog") return { background: "#FDEBD0", color: "#C0601A" };
  if (v === "Midden") return { background: "#ececec", color: "#666" };
  return { background: "#f7f7f7", color: "#888" };
}
function statusBg(v) {
  if (v === "Gereed") return { background: "#D1FAE5", color: "#047857" };
  if (v === "In uitvoering") return { background: "#DBEAFE", color: "#1D4ED8" };
  if (v === "In analyse") return { background: "#FEF3C7", color: "#92400E" };
  return { background: "#ececec", color: "#666" };
}
function dataBg(v) {
  if (v === "Ja") return { background: "#D1FAE5", color: "#047857" };
  if (v === "Deels") return { background: "#FEF3C7", color: "#92400E" };
  if (v === "Nee") return { background: "#FEE2E2", color: "#991B1B" };
  return { background: "#f7f7f7", color: "#888" };
}
function impactBg(v) {
  if (v === "XL" || v === "L") return { background: "#FDEBD0", color: "#C0601A" };
  if (v === "M") return { background: "#ececec", color: "#666" };
  return { background: "#f7f7f7", color: "#888" };
}

/* ── styles ── */
const S = {
  loginWrap: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f7f7f7" },
  loginBox: { background: "#fff", borderRadius: 12, padding: 40, width: 360, boxShadow: "0 2px 16px rgba(0,0,0,.08)", textAlign: "center" },
  loginHeader: { background: ORANGE, color: "#fff", borderRadius: "12px 12px 0 0", margin: "-40px -40px 24px", padding: "28px 40px", fontSize: 22, fontWeight: 700 },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #ececec", borderRadius: 8, fontSize: 15, fontFamily: "DM Sans", outline: "none" },
  btnOrange: { background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans" },
  error: { color: "#c0392b", fontSize: 13, marginTop: 8 },

  page: { maxWidth: 1400, margin: "0 auto", padding: "24px 20px" },
  topBar: { display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" },
  logo: { width: 38, height: 38, background: ORANGE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20, flexShrink: 0 },
  title: { fontSize: 22, fontWeight: 700, color: "#4A4A4A" },
  liveBadge: { background: "#FDEBD0", color: ORANGE, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 },

  kpiRow: { display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" },
  kpi: { background: "#fff", borderRadius: 10, padding: "14px 22px", flex: "1 1 140px", boxShadow: "0 1px 4px rgba(0,0,0,.05)" },
  kpiLabel: { fontSize: 12, color: "#888", marginBottom: 2 },
  kpiVal: { fontSize: 26, fontWeight: 700 },

  filterRow: { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" },
  filterBtn: { padding: "6px 16px", borderRadius: 20, border: "1.5px solid #ececec", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "DM Sans", color: "#666" },
  filterBtnActive: { padding: "6px 16px", borderRadius: 20, border: "1.5px solid " + ORANGE, background: "#FDEBD0", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "DM Sans", color: ORANGE },
  filterSep: { width: 1, height: 24, background: "#ececec", margin: "0 4px" },

  tableWrap: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.05)", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 900, fontSize: 14 },
  th: { textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 12, color: "#888", borderBottom: "2px solid #ececec", whiteSpace: "nowrap" },
  td: { padding: "8px 12px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" },
  laneRow: { background: "#f7f7f7" },
  laneDot: (c) => ({ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: c, marginRight: 8 }),
  badge: (bg) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", ...bg }),

  editInput: { border: "1.5px solid " + ORANGE, borderRadius: 6, padding: "4px 8px", fontSize: 14, fontFamily: "DM Sans", outline: "none", width: "100%" },
  delBtn: { background: "none", border: "none", color: "#ccc", fontSize: 18, cursor: "pointer", fontWeight: 700, padding: "0 6px", lineHeight: 1 },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 12, padding: 32, width: 400, maxWidth: "90vw" },
  modalTitle: { fontSize: 18, fontWeight: 700, marginBottom: 18, color: "#4A4A4A" },
  formGroup: { marginBottom: 14 },
  formLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#666", marginBottom: 4 },
  select: { width: "100%", padding: "8px 12px", border: "1.5px solid #ececec", borderRadius: 8, fontSize: 14, fontFamily: "DM Sans", outline: "none", background: "#fff" },

  toast: { position: "fixed", bottom: 24, right: 24, background: "#4A4A4A", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 500, zIndex: 2000, transition: "opacity .3s", boxShadow: "0 2px 8px rgba(0,0,0,.15)" },

  dropdownWrap: { position: "relative", display: "inline-block" },
  dropdown: { position: "absolute", top: "100%", left: 0, background: "#fff", border: "1.5px solid #ececec", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.1)", zIndex: 500, minWidth: 120, marginTop: 4, maxHeight: 200, overflowY: "auto" },
  dropdownItem: { padding: "7px 14px", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" },
};

/* ── components ── */

function InlineDropdown({ value, options, bgFn, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <span style={S.dropdownWrap} ref={ref}>
      <span style={S.badge(bgFn ? bgFn(value) : { background: "#ececec", color: "#666" })} onClick={() => setOpen(!open)}>
        {value || "\u2014"}
      </span>
      {open && (
        <div style={S.dropdown}>
          {options.map((o) => (
            <div key={o} style={{ ...S.dropdownItem, fontWeight: o === value ? 700 : 400 }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f7f7f7"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              onClick={() => { onChange(o); setOpen(false); }}>
              {o || "(leeg)"}
            </div>
          ))}
        </div>
      )}
    </span>
  );
}

function InlineText({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef();

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  if (editing) {
    return (
      <input ref={inputRef} style={S.editInput} value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); if (draft !== value) onChange(draft); }}
        onKeyDown={(e) => { if (e.key === "Enter") { setEditing(false); if (draft !== value) onChange(draft); } if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
      />
    );
  }
  return <span style={{ cursor: "pointer", padding: "4px 0", display: "inline-block", minWidth: 30 }} onClick={() => setEditing(true)}>{value || "\u2014"}</span>;
}

/* ── login screen ── */
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/reporting-backlog/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      const data = await res.json();
      if (data.ok) { sessionStorage.setItem("authenticated", "true"); onLogin(); }
      else setErr(data.error || "Ongeldig wachtwoord");
    } catch (e) { setErr("Verbinding mislukt"); }
    setLoading(false);
  };

  return (
    <div style={S.loginWrap}>
      <form style={S.loginBox} onSubmit={submit}>
        <div style={S.loginHeader}>GeriCall</div>
        <div style={{ marginBottom: 18, fontSize: 15, color: "#666" }}>Reporting backlog</div>
        <input type="password" placeholder="Wachtwoord" style={{ ...S.input, marginBottom: 12 }} value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        {err && <div style={S.error}>{err}</div>}
        <button type="submit" style={{ ...S.btnOrange, width: "100%", marginTop: 8 }} disabled={loading}>{loading ? "Even wachten\u2026" : "Inloggen"}</button>
      </form>
    </div>
  );
}

/* ── new item modal ── */
function NewItemModal({ onAdd, onClose }) {
  const [lane, setLane] = useState(LANES[0]);
  const [title, setTitle] = useState("");
  const [requestor, setRequestor] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ lane, title: title.trim(), requestor: requestor.trim() });
    onClose();
  };

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <form style={S.modal} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div style={S.modalTitle}>Nieuw item</div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Lane</label>
          <select style={S.select} value={lane} onChange={(e) => setLane(e.target.value)}>
            {LANES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Titel</label>
          <input style={S.input} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Requestor</label>
          <input style={S.input} value={requestor} onChange={(e) => setRequestor(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" style={{ ...S.filterBtn, padding: "8px 20px" }} onClick={onClose}>Annuleren</button>
          <button type="submit" style={S.btnOrange}>Toevoegen</button>
        </div>
      </form>
    </div>
  );
}

/* ── main app ── */
function Backlog() {
  const [items, setItems] = useState([]);
  const [filterLane, setFilterLane] = useState("Alle");
  const [filterStatus, setFilterStatus] = useState("Alle");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(false);
  const saveTimer = useRef(null);
  const itemsRef = useRef(items);

  useEffect(() => { itemsRef.current = items; }, [items]);

  /* load */
  useEffect(() => {
    fetch("/api/reporting-backlog/backlog").then((r) => r.json()).then(setItems);
  }, []);

  /* debounced save */
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await fetch("/api/reporting-backlog/backlog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: itemsRef.current }) });
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }, 800);
  }, []);

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));
    scheduleSave();
  };

  const addItem = ({ lane, title, requestor }) => {
    setItems((prev) => {
      const maxId = prev.reduce((m, it) => Math.max(m, it.id), 0);
      return [...prev, { id: maxId + 1, lane, prio: "Midden", status: "Backlog", title, owner: "", requestor, deadline: "", impact: "M", data: "" }];
    });
    scheduleSave();
  };

  const deleteItem = (id) => {
    if (!confirm("Zeker weten?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    scheduleSave();
  };

  /* filtering */
  const filtered = items.filter((it) => {
    if (filterLane !== "Alle" && it.lane !== filterLane) return false;
    if (filterStatus !== "Alle" && it.status !== filterStatus) return false;
    return true;
  });

  /* group by lane */
  const grouped = LANES.map((lane) => {
    const laneItems = filtered.filter((it) => it.lane === lane);
    return laneItems.length > 0 ? { lane, items: laneItems } : null;
  }).filter(Boolean);

  /* kpis */
  const kpiTotal = items.length;
  const kpiHigh = items.filter((it) => it.prio === "Hoog").length;
  const kpiNoOwner = items.filter((it) => !it.owner).length;
  const kpiDone = items.filter((it) => it.status === "Gereed").length;

  return (
    <div style={S.page}>
      {/* top bar */}
      <div style={S.topBar}>
        <div style={S.logo}>G</div>
        <span style={S.title}>Reporting backlog</span>
        <span style={S.liveBadge}>Live {'\u00B7'} bewerken</span>
        <div style={{ flex: 1 }} />
        <button style={S.btnOrange} onClick={() => setShowModal(true)}>+ Nieuw item</button>
      </div>

      {/* kpis */}
      <div style={S.kpiRow}>
        <div style={S.kpi}><div style={S.kpiLabel}>Totaal items</div><div style={S.kpiVal}>{kpiTotal}</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Hoge prioriteit</div><div style={{ ...S.kpiVal, color: ORANGE }}>{kpiHigh}</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Geen owner</div><div style={{ ...S.kpiVal, color: kpiNoOwner > 0 ? "#c0392b" : "#4A4A4A" }}>{kpiNoOwner}</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Gereed</div><div style={{ ...S.kpiVal, color: "#047857" }}>{kpiDone}</div></div>
      </div>

      {/* filters */}
      <div style={S.filterRow}>
        {["Alle", ...LANES].map((l) => (
          <button key={l} style={filterLane === l ? S.filterBtnActive : S.filterBtn} onClick={() => setFilterLane(l)}>{l}</button>
        ))}
        <div style={S.filterSep} />
        {["Alle", ...STATUSES].map((s) => (
          <button key={s} style={filterStatus === s ? S.filterBtnActive : S.filterBtn} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {/* table */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Titel</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Prioriteit</th>
              <th style={S.th}>Solution owner</th>
              <th style={S.th}>Requestor</th>
              <th style={S.th}>Deadline</th>
              <th style={S.th}>Impact</th>
              <th style={S.th}>Data</th>
              <th style={{ ...S.th, width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((g) => (
              <React.Fragment key={g.lane}>
                <tr style={S.laneRow}>
                  <td colSpan={9} style={{ ...S.td, fontWeight: 700, fontSize: 13, color: "#4A4A4A", padding: "10px 12px" }}>
                    <span style={S.laneDot(LANE_COLORS[g.lane] || "#888")} />
                    {g.lane}
                    <span style={{ fontWeight: 400, color: "#888", marginLeft: 8 }}>({g.items.length})</span>
                  </td>
                </tr>
                {g.items.map((it) => (
                  <tr key={it.id}>
                    <td style={{ ...S.td, fontWeight: 500, minWidth: 200 }}>
                      <InlineText value={it.title} onChange={(v) => updateItem(it.id, "title", v)} />
                    </td>
                    <td style={S.td}>
                      <InlineDropdown value={it.status} options={STATUSES} bgFn={statusBg} onChange={(v) => updateItem(it.id, "status", v)} />
                    </td>
                    <td style={S.td}>
                      <InlineDropdown value={it.prio} options={PRIOS} bgFn={prioBg} onChange={(v) => updateItem(it.id, "prio", v)} />
                    </td>
                    <td style={S.td}>
                      <InlineDropdown value={it.owner} options={OWNERS} bgFn={() => ({ background: "#ececec", color: "#666" })} onChange={(v) => updateItem(it.id, "owner", v)} />
                    </td>
                    <td style={{ ...S.td, minWidth: 100 }}>
                      <InlineText value={it.requestor} onChange={(v) => updateItem(it.id, "requestor", v)} />
                    </td>
                    <td style={{ ...S.td, minWidth: 100 }}>
                      <InlineText value={it.deadline} onChange={(v) => updateItem(it.id, "deadline", v)} />
                    </td>
                    <td style={S.td}>
                      <InlineDropdown value={it.impact} options={IMPACTS} bgFn={impactBg} onChange={(v) => updateItem(it.id, "impact", v)} />
                    </td>
                    <td style={S.td}>
                      <InlineDropdown value={it.data} options={DATA_OPTS} bgFn={dataBg} onChange={(v) => updateItem(it.id, "data", v)} />
                    </td>
                    <td style={S.td}>
                      <button style={S.delBtn} title="Verwijderen" onClick={() => deleteItem(it.id)}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#c0392b"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#ccc"}>{'\u00D7'}</button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {grouped.length === 0 && (
              <tr><td colSpan={9} style={{ ...S.td, textAlign: "center", color: "#888", padding: 40 }}>Geen items gevonden</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && <NewItemModal onAdd={addItem} onClose={() => setShowModal(false)} />}
      {toast && <div style={S.toast}>Opgeslagen</div>}
    </div>
  );
}

/* ── root ── */
function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("authenticated") === "true");
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Backlog />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
