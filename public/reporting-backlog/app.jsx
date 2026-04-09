const { useState, useEffect, useRef, useCallback } = React;

/* ── constants ── */
const ORANGE = "#E8732A";
const MONTHS_NL = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
var DEADLINES = [""];
(function() { for (var y = 2026; y <= 2027; y++) { for (var m = (y === 2026 ? 3 : 0); m < 12; m++) { DEADLINES.push(MONTHS_NL[m] + " " + y); } } })();

const DEFAULT_CONFIG = {
  owners: ["Koen", "Ren\u00e9", "Laurina", "Jeff", "Niels", "Raymond", "Tobias", "Rosalie", "Allard", "Famke"],
  lanes: ["Ad hoc", "Onderhoud", "Dashboards", "Analyses", "Voorspellend", "Overig"],
  statuses: ["Backlog", "In analyse", "In uitvoering", "Gereed"],
  priorities: ["Hoog", "Midden", "Laag"],
  impacts: ["XS", "S", "M", "L", "XL"],
  dataOptions: ["Ja", "Deels", "Nee"],
};

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
  loginHeader: { background: ORANGE, borderRadius: "12px 12px 0 0", margin: "-40px -40px 24px", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "center" },
  loginLogo: { height: 48, borderRadius: 8 },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #ececec", borderRadius: 8, fontSize: 15, fontFamily: "DM Sans", outline: "none" },
  btnOrange: { background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans" },
  btnGrey: { background: "#fff", color: "#666", border: "1.5px solid #ececec", borderRadius: 8, padding: "10px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans" },
  error: { color: "#c0392b", fontSize: 13, marginTop: 8 },

  page: { maxWidth: 1400, margin: "0 auto", padding: "24px 20px" },
  topBar: { display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" },
  logo: { height: 34, borderRadius: 6, flexShrink: 0 },
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
  laneDot: function(c) { return { display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: c, marginRight: 8 }; },
  badge: function(bg) { return Object.assign({ display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer" }, bg); },

  editInput: { border: "1.5px solid " + ORANGE, borderRadius: 6, padding: "4px 8px", fontSize: 14, fontFamily: "DM Sans", outline: "none", width: "100%" },
  delBtn: { background: "none", border: "none", color: "#ccc", fontSize: 18, cursor: "pointer", fontWeight: 700, padding: "0 6px", lineHeight: 1 },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 12, padding: 32, width: 400, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" },
  modalWide: { background: "#fff", borderRadius: 12, padding: 32, width: 600, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontSize: 18, fontWeight: 700, marginBottom: 18, color: "#4A4A4A" },
  formGroup: { marginBottom: 14 },
  formLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#666", marginBottom: 4 },
  select: { width: "100%", padding: "8px 12px", border: "1.5px solid #ececec", borderRadius: 8, fontSize: 14, fontFamily: "DM Sans", outline: "none", background: "#fff" },

  toast: { position: "fixed", bottom: 24, right: 24, background: "#4A4A4A", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 500, zIndex: 2000, transition: "opacity .3s", boxShadow: "0 2px 8px rgba(0,0,0,.15)" },

  dropdownWrap: { position: "relative", display: "inline-block" },
  dropdown: { position: "absolute", top: "100%", left: 0, background: "#fff", border: "1.5px solid #ececec", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.1)", zIndex: 500, minWidth: 120, marginTop: 4, maxHeight: 200, overflowY: "auto" },
  dropdownItem: { padding: "7px 14px", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" },

  gearBtn: { background: "none", border: "1.5px solid #ececec", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16, color: "#888", fontFamily: "DM Sans", display: "flex", alignItems: "center", gap: 6 },
  adminSection: { marginBottom: 20, borderBottom: "1px solid #ececec", paddingBottom: 16 },
  adminSectionTitle: { fontSize: 14, fontWeight: 700, color: "#4A4A4A", marginBottom: 8 },
  chip: { display: "inline-flex", alignItems: "center", gap: 4, background: "#f7f7f7", border: "1px solid #ececec", borderRadius: 16, padding: "4px 10px", fontSize: 13, color: "#4A4A4A", margin: "3px 4px 3px 0" },
  chipDel: { background: "none", border: "none", color: "#ccc", cursor: "pointer", fontWeight: 700, fontSize: 14, padding: 0, lineHeight: 1 },
  addLaneRow: { cursor: "pointer", background: "#fff" },
  addLaneCell: { padding: "6px 12px", color: "#ccc", fontSize: 13, borderBottom: "1px solid #f0f0f0" },
  addRow: { display: "flex", gap: 8, marginTop: 8 },
  addInput: { flex: 1, padding: "6px 10px", border: "1.5px solid #ececec", borderRadius: 8, fontSize: 13, fontFamily: "DM Sans", outline: "none" },
  addBtn: { background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans" },
};

/* ── components ── */

function InlineDropdown({ value, options, bgFn, onChange }) {
  const [open, setOpen] = useState(false);
  var ref = useRef();

  useEffect(function() {
    if (!open) return;
    var handler = function(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return function() { document.removeEventListener("mousedown", handler); };
  }, [open]);

  return (
    <span style={S.dropdownWrap} ref={ref}>
      <span style={S.badge(bgFn ? bgFn(value) : { background: "#ececec", color: "#666" })} onClick={function() { setOpen(!open); }}>
        {value || "\u2014"}
      </span>
      {open && (
        <div style={S.dropdown}>
          {options.map(function(o) { return (
            <div key={o} style={Object.assign({}, S.dropdownItem, { fontWeight: o === value ? 700 : 400 })}
              onMouseEnter={function(e) { e.currentTarget.style.background = "#f7f7f7"; }}
              onMouseLeave={function(e) { e.currentTarget.style.background = "#fff"; }}
              onClick={function() { onChange(o); setOpen(false); }}>
              {o || "(leeg)"}
            </div>
          ); })}
        </div>
      )}
    </span>
  );
}

function InlineText({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  var inputRef = useRef();

  useEffect(function() { setDraft(value); }, [value]);
  useEffect(function() { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  if (editing) {
    return (
      <input ref={inputRef} style={S.editInput} value={draft}
        onChange={function(e) { setDraft(e.target.value); }}
        onBlur={function() { setEditing(false); if (draft !== value) onChange(draft); }}
        onKeyDown={function(e) { if (e.key === "Enter") { setEditing(false); if (draft !== value) onChange(draft); } if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
      />
    );
  }
  return <span style={{ cursor: "pointer", padding: "4px 0", display: "inline-block", minWidth: 30 }} onClick={function() { setEditing(true); }}>{value || "\u2014"}</span>;
}

/* ── login screen ── */
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  var submit = function(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    fetch("/api/reporting-backlog/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.ok) { sessionStorage.setItem("authenticated", "true"); onLogin(); }
        else setErr(data.error || "Ongeldig wachtwoord");
        setLoading(false);
      })
      .catch(function() { setErr("Verbinding mislukt"); setLoading(false); });
  };

  return (
    <div style={S.loginWrap}>
      <form style={S.loginBox} onSubmit={submit}>
        <div style={S.loginHeader}><img src="/reporting-backlog/logo.jfif" alt="GeriCall" style={S.loginLogo} /></div>
        <div style={{ marginBottom: 18, fontSize: 15, color: "#666" }}>Reporting backlog</div>
        <input type="password" placeholder="Wachtwoord" style={Object.assign({}, S.input, { marginBottom: 12 })} value={pw} onChange={function(e) { setPw(e.target.value); }} autoFocus />
        {err && <div style={S.error}>{err}</div>}
        <button type="submit" style={Object.assign({}, S.btnOrange, { width: "100%", marginTop: 8 })} disabled={loading}>{loading ? "Even wachten\u2026" : "Inloggen"}</button>
      </form>
    </div>
  );
}

/* ── admin config editor section ── */
function AdminSection({ label, items, onUpdate }) {
  const [newVal, setNewVal] = useState("");

  var addItem = function() {
    var v = newVal.trim();
    if (!v || items.indexOf(v) !== -1) return;
    onUpdate(items.concat([v]));
    setNewVal("");
  };

  var removeItem = function(idx) {
    onUpdate(items.filter(function(_, i) { return i !== idx; }));
  };

  return (
    <div style={S.adminSection}>
      <div style={S.adminSectionTitle}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {items.map(function(item, idx) { return (
          <span key={item} style={S.chip}>
            {item}
            <button style={S.chipDel} onClick={function() { removeItem(idx); }}
              onMouseEnter={function(e) { e.currentTarget.style.color = "#c0392b"; }}
              onMouseLeave={function(e) { e.currentTarget.style.color = "#ccc"; }}>{'\u00D7'}</button>
          </span>
        ); })}
      </div>
      <div style={S.addRow}>
        <input style={S.addInput} placeholder={"Nieuwe " + label.toLowerCase() + "\u2026"}
          value={newVal} onChange={function(e) { setNewVal(e.target.value); }}
          onKeyDown={function(e) { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} />
        <button style={S.addBtn} onClick={addItem}>Toevoegen</button>
      </div>
    </div>
  );
}

/* ── admin modal ── */
function AdminModal({ config, onSave, onClose }) {
  const [draft, setDraft] = useState(config);
  const [saving, setSaving] = useState(false);

  var updateField = function(field, values) {
    var next = Object.assign({}, draft);
    next[field] = values;
    setDraft(next);
  };

  var save = function() {
    setSaving(true);
    fetch("/api/reporting-backlog/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) })
      .then(function(r) { return r.json(); })
      .then(function() {
        onSave(draft);
        setSaving(false);
        onClose();
      })
      .catch(function() { setSaving(false); });
  };

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalWide} onClick={function(e) { e.stopPropagation(); }}>
        <div style={S.modalTitle}>{'\u2699\uFE0F'} Beheer dropdowns</div>

        <AdminSection label="Solution owners" items={draft.owners} onUpdate={function(v) { updateField("owners", v); }} />
        <AdminSection label="Lanes" items={draft.lanes} onUpdate={function(v) { updateField("lanes", v); }} />
        <AdminSection label="Statussen" items={draft.statuses} onUpdate={function(v) { updateField("statuses", v); }} />
        <AdminSection label="Prioriteiten" items={draft.priorities} onUpdate={function(v) { updateField("priorities", v); }} />
        <AdminSection label="Impact" items={draft.impacts} onUpdate={function(v) { updateField("impacts", v); }} />
        <AdminSection label="Data beschikbaar" items={draft.dataOptions} onUpdate={function(v) { updateField("dataOptions", v); }} />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={S.btnGrey} onClick={onClose}>Annuleren</button>
          <button style={S.btnOrange} onClick={save} disabled={saving}>{saving ? "Opslaan\u2026" : "Opslaan"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── new item modal ── */
function NewItemModal({ config, onAdd, onClose }) {
  const [lane, setLane] = useState(config.lanes[0] || "");
  const [title, setTitle] = useState("");
  const [requestor, setRequestor] = useState("");

  var submit = function(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ lane: lane, title: title.trim(), requestor: requestor.trim() });
    onClose();
  };

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <form style={S.modal} onClick={function(e) { e.stopPropagation(); }} onSubmit={submit}>
        <div style={S.modalTitle}>Nieuw item</div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Lane</label>
          <select style={S.select} value={lane} onChange={function(e) { setLane(e.target.value); }}>
            {config.lanes.map(function(l) { return <option key={l}>{l}</option>; })}
          </select>
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Titel</label>
          <input style={S.input} value={title} onChange={function(e) { setTitle(e.target.value); }} autoFocus />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Requestor</label>
          <select style={S.select} value={requestor} onChange={function(e) { setRequestor(e.target.value); }}>
            <option value="">(geen)</option>
            {config.owners.map(function(o) { return <option key={o} value={o}>{o}</option>; })}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" style={Object.assign({}, S.filterBtn, { padding: "8px 20px" })} onClick={onClose}>Annuleren</button>
          <button type="submit" style={S.btnOrange}>Toevoegen</button>
        </div>
      </form>
    </div>
  );
}

/* ── main app ── */
function Backlog() {
  const [items, setItems] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [filterLane, setFilterLane] = useState("Alle");
  const [filterStatus, setFilterStatus] = useState("Alle");
  const [showModal, setShowModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [toast, setToast] = useState(false);
  var saveTimer = useRef(null);
  var itemsRef = useRef(items);

  useEffect(function() { itemsRef.current = items; }, [items]);

  /* load data + config */
  useEffect(function() {
    fetch("/api/reporting-backlog/backlog").then(function(r) { return r.json(); }).then(setItems);
    fetch("/api/reporting-backlog/config").then(function(r) { return r.json(); }).then(setConfig);
  }, []);

  /* debounced save */
  var scheduleSave = useCallback(function() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(function() {
      fetch("/api/reporting-backlog/backlog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: itemsRef.current }) })
        .then(function() { setToast(true); setTimeout(function() { setToast(false); }, 2000); });
    }, 800);
  }, []);

  var updateItem = function(id, field, value) {
    setItems(function(prev) { return prev.map(function(it) { return it.id === id ? Object.assign({}, it, { [field]: value }) : it; }); });
    scheduleSave();
  };

  var addItem = function(data) {
    setItems(function(prev) {
      var maxId = prev.reduce(function(m, it) { return Math.max(m, it.id); }, 0);
      return prev.concat([{ id: maxId + 1, lane: data.lane, prio: config.priorities[1] || "Midden", status: config.statuses[0] || "Backlog", title: data.title, owner: "", requestor: data.requestor, deadline: "", impact: "M", data: "" }]);
    });
    scheduleSave();
  };

  var addItemToLane = function(lane) {
    setItems(function(prev) {
      var maxId = prev.reduce(function(m, it) { return Math.max(m, it.id); }, 0);
      return prev.concat([{ id: maxId + 1, lane: lane, prio: config.priorities[1] || "Midden", status: config.statuses[0] || "Backlog", title: "", owner: "", requestor: "", deadline: "", impact: "M", data: "" }]);
    });
    scheduleSave();
  };

  var deleteItem = function(id) {
    if (!confirm("Zeker weten?")) return;
    setItems(function(prev) { return prev.filter(function(it) { return it.id !== id; }); });
    scheduleSave();
  };

  /* filtering */
  var filtered = items.filter(function(it) {
    if (filterLane !== "Alle" && it.lane !== filterLane) return false;
    if (filterStatus !== "Alle" && it.status !== filterStatus) return false;
    return true;
  });

  /* group by lane (use config lanes order) */
  var activeLanes = config.lanes;
  var grouped = activeLanes.map(function(lane) {
    var laneItems = filtered.filter(function(it) { return it.lane === lane; });
    return laneItems.length > 0 ? { lane: lane, items: laneItems } : null;
  }).filter(Boolean);

  /* kpis */
  var kpiTotal = items.length;
  var kpiHigh = items.filter(function(it) { return it.prio === "Hoog"; }).length;
  var kpiNoOwner = items.filter(function(it) { return !it.owner; }).length;
  var kpiDone = items.filter(function(it) { return it.status === "Gereed"; }).length;

  /* owner options with empty first */
  var ownerOptions = [""].concat(config.owners);

  return (
    <div style={S.page}>
      {/* top bar */}
      <div style={S.topBar}>
        <img src="/reporting-backlog/logo.jfif" alt="GeriCall" style={S.logo} />
        <span style={S.title}>Reporting backlog</span>
        <span style={S.liveBadge}>Live {'\u00B7'} bewerken</span>
        <div style={{ flex: 1 }} />
        <button style={S.gearBtn} onClick={function() { setShowAdmin(true); }}
          onMouseEnter={function(e) { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.color = ORANGE; }}
          onMouseLeave={function(e) { e.currentTarget.style.borderColor = "#ececec"; e.currentTarget.style.color = "#888"; }}>
          {'\u2699'} Beheer
        </button>
        <button style={S.btnOrange} onClick={function() { setShowModal(true); }}>+ Nieuw item</button>
      </div>

      {/* kpis */}
      <div style={S.kpiRow}>
        <div style={S.kpi}><div style={S.kpiLabel}>Totaal items</div><div style={S.kpiVal}>{kpiTotal}</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Hoge prioriteit</div><div style={Object.assign({}, S.kpiVal, { color: ORANGE })}>{kpiHigh}</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Geen owner</div><div style={Object.assign({}, S.kpiVal, { color: kpiNoOwner > 0 ? "#c0392b" : "#4A4A4A" })}>{kpiNoOwner}</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Gereed</div><div style={Object.assign({}, S.kpiVal, { color: "#047857" })}>{kpiDone}</div></div>
      </div>

      {/* filters */}
      <div style={S.filterRow}>
        {["Alle"].concat(config.lanes).map(function(l) { return (
          <button key={l} style={filterLane === l ? S.filterBtnActive : S.filterBtn} onClick={function() { setFilterLane(l); }}>{l}</button>
        ); })}
        <div style={S.filterSep} />
        {["Alle"].concat(config.statuses).map(function(s) { return (
          <button key={s} style={filterStatus === s ? S.filterBtnActive : S.filterBtn} onClick={function() { setFilterStatus(s); }}>{s}</button>
        ); })}
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
              <th style={Object.assign({}, S.th, { width: 36 })}></th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(function(g) { return (
              <React.Fragment key={g.lane}>
                <tr style={S.laneRow}>
                  <td colSpan={9} style={Object.assign({}, S.td, { fontWeight: 700, fontSize: 13, color: "#4A4A4A", padding: "10px 12px" })}>
                    <span style={S.laneDot(LANE_COLORS[g.lane] || "#888")} />
                    {g.lane}
                    <span style={{ fontWeight: 400, color: "#888", marginLeft: 8 }}>({g.items.length})</span>
                  </td>
                </tr>
                {g.items.map(function(it) { return (
                  <tr key={it.id}>
                    <td style={Object.assign({}, S.td, { fontWeight: 500, minWidth: 200 })}>
                      <InlineText value={it.title} onChange={function(v) { updateItem(it.id, "title", v); }} />
                    </td>
                    <td style={S.td}>
                      <InlineDropdown value={it.status} options={config.statuses} bgFn={statusBg} onChange={function(v) { updateItem(it.id, "status", v); }} />
                    </td>
                    <td style={S.td}>
                      <InlineDropdown value={it.prio} options={config.priorities} bgFn={prioBg} onChange={function(v) { updateItem(it.id, "prio", v); }} />
                    </td>
                    <td style={S.td}>
                      <InlineDropdown value={it.owner} options={ownerOptions} bgFn={function() { return { background: "#ececec", color: "#666" }; }} onChange={function(v) { updateItem(it.id, "owner", v); }} />
                    </td>
                    <td style={Object.assign({}, S.td, { minWidth: 100 })}>
                      <InlineDropdown value={it.requestor} options={ownerOptions} bgFn={function() { return { background: "#ececec", color: "#666" }; }} onChange={function(v) { updateItem(it.id, "requestor", v); }} />
                    </td>
                    <td style={Object.assign({}, S.td, { minWidth: 100 })}>
                      <InlineDropdown value={it.deadline} options={DEADLINES} bgFn={function(v) { return v ? { background: "#ececec", color: "#666" } : { background: "#f7f7f7", color: "#888" }; }} onChange={function(v) { updateItem(it.id, "deadline", v); }} />
                    </td>
                    <td style={S.td}>
                      <InlineDropdown value={it.impact} options={config.impacts} bgFn={impactBg} onChange={function(v) { updateItem(it.id, "impact", v); }} />
                    </td>
                    <td style={S.td}>
                      <InlineDropdown value={it.data} options={config.dataOptions} bgFn={dataBg} onChange={function(v) { updateItem(it.id, "data", v); }} />
                    </td>
                    <td style={S.td}>
                      <button style={S.delBtn} title="Verwijderen" onClick={function() { deleteItem(it.id); }}
                        onMouseEnter={function(e) { e.currentTarget.style.color = "#c0392b"; }}
                        onMouseLeave={function(e) { e.currentTarget.style.color = "#ccc"; }}>{'\u00D7'}</button>
                    </td>
                  </tr>
                ); })}
                <tr style={S.addLaneRow} onClick={function() { addItemToLane(g.lane); }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = "#f7f7f7"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = "#fff"; }}>
                  <td colSpan={9} style={S.addLaneCell}>
                    <span style={{ marginRight: 6 }}>+</span> Nieuw item in {g.lane}
                  </td>
                </tr>
              </React.Fragment>
            ); })}
            {grouped.length === 0 && (
              <tr><td colSpan={9} style={Object.assign({}, S.td, { textAlign: "center", color: "#888", padding: 40 })}>Geen items gevonden</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && <NewItemModal config={config} onAdd={addItem} onClose={function() { setShowModal(false); }} />}
      {showAdmin && <AdminModal config={config} onSave={setConfig} onClose={function() { setShowAdmin(false); }} />}
      {toast && <div style={S.toast}>Opgeslagen</div>}
    </div>
  );
}

/* ── root ── */
function App() {
  const [authed, setAuthed] = useState(function() { return sessionStorage.getItem("authenticated") === "true"; });
  if (!authed) return <LoginScreen onLogin={function() { setAuthed(true); }} />;
  return <Backlog />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
