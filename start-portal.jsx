import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── Brand tokens ────────────────────────────────────────────────
const COLORS = {
  orange: "#E8732A",
  orangeLight: "#F09A5E",
  orangePale: "#FFF3EB",
  grey900: "#1a1a1a",
  grey800: "#2d2d2d",
  grey600: "#555555",
  grey400: "#999999",
  grey200: "#d4d4d4",
  grey100: "#ececec",
  grey50: "#f7f7f7",
  green: "#2D9D78",
  greenLight: "#E8F5F0",
  red: "#D94F4F",
  redLight: "#FCEAEA",
  blue: "#4A7FB5",
  blueLight: "#EBF2F9",
  white: "#ffffff",
};

// ─── Mocked data ─────────────────────────────────────────────────
const INSTITUTION = { naam: "De Linde", ivr: "088-123 2471", token: "DL-2026-A7" };

const PHYSICIAN_REQUESTS = [
  {
    id: "2847",
    type: "supplement",
    typeLabel: "Aanvullende metingen",
    omschrijving: "Bloeddruk, temperatuur, O₂",
    tijdGeleden: "10 min geleden",
    velden: ["Bloeddruk", "Temperatuur", "O₂ Saturatie"],
  },
  {
    id: "2839",
    type: "video",
    typeLabel: "Video-oproep",
    omschrijving: "Wondbeoordeling",
    extra: "3 vragen te beantwoorden",
    tijdGeleden: "5 min geleden",
    vragen: ["Grootte van de wond?", "Kleur / afscheiding?", "Pijnniveau (1–10)?"],
  },
];

const OPEN_CONSULTS = [
  { id: "2851", status: "In behandeling bij arts", tijdGeleden: "2 min geleden" },
];

// ─── Views ───────────────────────────────────────────────────────
const VIEW = {
  QR_ENTRY: "QR_ENTRY",
  DASHBOARD: "DASHBOARD",
  SUPPLEMENT_FORM: "SUPPLEMENT_FORM",
  SUPPLEMENT_CONFIRM: "SUPPLEMENT_CONFIRM",
  VIDEO_PREQUESTIONS: "VIDEO_PREQUESTIONS",
  VIDEO_INCALL: "VIDEO_INCALL",
  DCR_WIZARD: "DCR_WIZARD",
  DCR_CONFIRM: "DCR_CONFIRM",
};

// ─── Helpers ─────────────────────────────────────────────────────
const FontLoader = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
);

// ─── Shared Components ───────────────────────────────────────────

function AppShell({ children }) {
  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100vh",
        background: COLORS.grey50,
        fontFamily: "'DM Sans', sans-serif",
        color: COLORS.grey900,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function SessionHeader() {
  return (
    <div
      style={{
        background: COLORS.white,
        borderBottom: `1px solid ${COLORS.grey100}`,
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.grey900 }}>
          {INSTITUTION.naam}
        </div>
        <div style={{ fontSize: 13, color: COLORS.grey600 }}>
          IVR: {INSTITUTION.ivr}
        </div>
      </div>
      <div
        style={{
          background: COLORS.orangePale,
          color: COLORS.orange,
          fontSize: 12,
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 20,
        }}
      >
        Sessie: 8u geldig
      </div>
    </div>
  );
}

function BackHeader({ label, onBack }) {
  return (
    <div
      style={{
        background: COLORS.white,
        borderBottom: `1px solid ${COLORS.grey100}`,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          fontSize: 16,
          color: COLORS.orange,
          fontWeight: 600,
          cursor: "pointer",
          padding: "4px 0",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        ← Terug
      </button>
      <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.grey900 }}>
        {label}
      </span>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, style: extra }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? COLORS.grey200 : COLORS.orange,
        color: disabled ? COLORS.grey400 : COLORS.white,
        borderRadius: 12,
        padding: "16px",
        fontSize: 16,
        fontWeight: 700,
        width: "100%",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "'DM Sans', sans-serif",
        transition: "background 0.2s, color 0.2s",
        ...extra,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, onClick, style: extra }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.white,
        borderRadius: 12,
        border: `1px solid ${COLORS.grey100}`,
        padding: 16,
        marginBottom: 10,
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s",
        ...extra,
      }}
    >
      {children}
    </div>
  );
}

function Badge({ children, color = COLORS.orange }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: color === COLORS.orange ? COLORS.orangePale : `${color}20`,
        color,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: 6,
      }}
    >
      {children}
    </span>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder, filled, style: extra, ...rest }) {
  const isFilled = filled !== undefined ? filled : (value !== "" && value !== undefined);
  return (
    <div style={{ marginBottom: 14, ...extra }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.grey800,
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            border: isFilled
              ? `2px solid ${COLORS.orange}`
              : `1px solid ${COLORS.grey200}`,
            borderRadius: 8,
            padding: "12px 14px",
            paddingRight: isFilled ? 36 : 14,
            fontSize: 18,
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
            transition: "border 0.2s",
          }}
          {...rest}
        />
        {isFilled && (
          <span
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: COLORS.green,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            ✓
          </span>
        )}
      </div>
    </div>
  );
}

function Toast({ message, visible }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: visible ? 30 : -60,
        left: "50%",
        transform: "translateX(-50%)",
        background: COLORS.grey900,
        color: COLORS.white,
        padding: "12px 24px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        zIndex: 1000,
        transition: "bottom 0.3s ease",
        whiteSpace: "nowrap",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {message}
    </div>
  );
}

function SuccessScreen({ title, subtitle, onBack }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        textAlign: "center",
        minHeight: "60vh",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: COLORS.greenLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <span style={{ color: COLORS.green, fontSize: 40, lineHeight: 1 }}>✓</span>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: COLORS.grey900 }}>
        {title}
      </h2>
      <p style={{ fontSize: 15, color: COLORS.grey600, marginBottom: 32, lineHeight: 1.5 }}>
        {subtitle}
      </p>
      <PrimaryButton onClick={onBack}>Terug naar dashboard</PrimaryButton>
    </div>
  );
}

function ScreenTransition({ children, viewKey }) {
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    setOpacity(0);
    const t = requestAnimationFrame(() => setOpacity(1));
    return () => cancelAnimationFrame(t);
  }, [viewKey]);
  return (
    <div style={{ opacity, transition: "opacity 0.25s ease-in" }}>
      {children}
    </div>
  );
}

// ─── Screens ─────────────────────────────────────────────────────

function QREntryScreen({ onScan, hasOpenRequest }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 32,
        textAlign: "center",
      }}
    >
      {/* SMS notification banner */}
      {hasOpenRequest && (
        <div
          style={{
            background: COLORS.blueLight,
            border: `1px solid ${COLORS.blue}`,
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 24,
            width: "100%",
            maxWidth: 320,
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 11, color: COLORS.blue, fontWeight: 600, marginBottom: 4 }}>
            📱 SMS-notificatie
          </div>
          <div style={{ fontSize: 13, color: COLORS.grey800, lineHeight: 1.4 }}>
            U heeft een openstaand verzoek van de arts. Scan de QR om te reageren.
          </div>
        </div>
      )}

      {/* Logo area */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.orange,
          marginBottom: 8,
        }}
      >
        GeriCall
      </div>
      <div style={{ fontSize: 14, color: COLORS.grey600, marginBottom: 32 }}>
        Start Portal
      </div>

      {/* Mock QR */}
      <div
        style={{
          width: 180,
          height: 180,
          border: `2px dashed ${COLORS.grey200}`,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          background: COLORS.white,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 4 }}>⣿⣿⣿</div>
          <div style={{ fontSize: 48, marginBottom: 4 }}>⣿⣿⣿</div>
          <div style={{ fontSize: 12, color: COLORS.grey400 }}>QR Code</div>
        </div>
      </div>

      <PrimaryButton onClick={onScan} style={{ maxWidth: 280 }}>
        Simuleer QR scan
      </PrimaryButton>
      <div style={{ fontSize: 13, color: COLORS.grey400, marginTop: 12 }}>
        Prototype — scan simuleert login voor "{INSTITUTION.naam}"
      </div>
    </div>
  );
}

function DashboardScreen({ onNavigate, showEmpty, onToggleEmpty }) {
  return (
    <div>
      <SessionHeader />

      <div style={{ padding: "16px 20px 100px" }}>
        {/* Toggle empty state (prototype control) */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            onClick={onToggleEmpty}
            style={{
              background: "transparent",
              color: COLORS.grey400,
              fontSize: 11,
              border: `1px solid ${COLORS.grey200}`,
              borderRadius: 6,
              padding: "3px 8px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {showEmpty ? "Toon verzoeken" : "Toon lege staat"}
          </button>
        </div>

        {/* Physician requests */}
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.grey400,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            Verzoeken van de arts
          </h3>

          {showEmpty ? (
            <Card>
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.grey800, marginBottom: 4 }}>
                  Geen openstaande verzoeken
                </div>
                <div style={{ fontSize: 13, color: COLORS.grey400 }}>
                  Nieuwe verzoeken van de arts verschijnen hier automatisch.
                </div>
              </div>
            </Card>
          ) : (
            PHYSICIAN_REQUESTS.map((req) => (
              <Card
                key={req.id}
                onClick={() =>
                  onNavigate(
                    req.type === "supplement"
                      ? VIEW.SUPPLEMENT_FORM
                      : VIEW.VIDEO_PREQUESTIONS
                  )
                }
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Badge>{req.typeLabel}</Badge>
                      <span style={{ fontSize: 13, color: COLORS.grey400 }}>
                        #{req.id}
                      </span>
                    </div>
                    <div style={{ fontSize: 15, color: COLORS.grey800, marginBottom: 4 }}>
                      {req.omschrijving}
                    </div>
                    {req.extra && (
                      <div style={{ fontSize: 13, color: COLORS.orange, fontWeight: 500 }}>
                        + {req.extra}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: COLORS.grey400, marginTop: 6 }}>
                      {req.tijdGeleden}
                    </div>
                  </div>
                  <span style={{ color: COLORS.grey400, fontSize: 20, marginLeft: 8, marginTop: 4 }}>
                    ›
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Consult status strip */}
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.grey400,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            Open consulten
          </h3>
          {OPEN_CONSULTS.map((c) => (
            <div
              key={c.id}
              style={{
                background: COLORS.blueLight,
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: COLORS.blue,
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: 14, color: COLORS.grey800 }}>
                <strong>Consult #{c.id}</strong> — {c.status} · {c.tijdGeleden}
              </div>
            </div>
          ))}
        </div>

        {/* New consult button */}
        <div style={{ marginBottom: 20 }}>
          <PrimaryButton onClick={() => onNavigate(VIEW.DCR_WIZARD)}>
            Nieuwe consultaanvraag (DCR)
          </PrimaryButton>
          <div
            style={{
              textAlign: "center",
              fontSize: 13,
              color: COLORS.grey400,
              marginTop: 6,
            }}
          >
            Digitale aanvraag indienen
          </div>
        </div>

        {/* Phone fallback */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: 12,
            border: `1px solid ${COLORS.grey100}`,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, color: COLORS.grey400, marginBottom: 6 }}>
            Of bel direct:
          </div>
          <a
            href={`tel:${INSTITUTION.ivr.replace(/[\s-]/g, "")}`}
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.orange,
              textDecoration: "none",
            }}
          >
            {INSTITUTION.ivr}
          </a>
          <div style={{ fontSize: 12, color: COLORS.red, marginTop: 6, fontWeight: 500 }}>
            Voor acute situaties
          </div>
        </div>
      </div>
    </div>
  );
}

function SupplementFormScreen({ onBack, onSubmit }) {
  const [bp1, setBp1] = useState("");
  const [bp2, setBp2] = useState("");
  const [temp, setTemp] = useState("");
  const [o2, setO2] = useState("");
  const [photo, setPhoto] = useState(false);
  const [notes, setNotes] = useState("");

  const filledCount = [bp1 && bp2, temp, o2].filter(Boolean).length;
  const allFilled = filledCount === 3;

  return (
    <div>
      <BackHeader label="Supplement · #2847" onBack={onBack} />
      <SessionHeader />

      <div style={{ padding: "20px 20px 40px" }}>
        {/* Progress */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.grey600,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <span style={{ color: allFilled ? COLORS.green : COLORS.orange }}>
            {filledCount} / 3
          </span>{" "}
          ingevuld
        </div>

        {/* Bloeddruk */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.grey800,
              marginBottom: 6,
            }}
          >
            Bloeddruk
          </label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="number"
                placeholder="Syst."
                value={bp1}
                onChange={(e) => setBp1(e.target.value)}
                style={{
                  border: bp1
                    ? `2px solid ${COLORS.orange}`
                    : `1px solid ${COLORS.grey200}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 22,
                  width: "100%",
                  boxSizing: "border-box",
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              />
            </div>
            <span style={{ fontSize: 18, color: COLORS.grey400 }}>/</span>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="number"
                placeholder="Diast."
                value={bp2}
                onChange={(e) => setBp2(e.target.value)}
                style={{
                  border: bp2
                    ? `2px solid ${COLORS.orange}`
                    : `1px solid ${COLORS.grey200}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 22,
                  width: "100%",
                  boxSizing: "border-box",
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              />
            </div>
            {bp1 && bp2 && (
              <span style={{ color: COLORS.green, fontSize: 20, fontWeight: 700 }}>✓</span>
            )}
          </div>
        </div>

        {/* Temperatuur */}
        <InputField
          label="Temperatuur (°C)"
          type="number"
          step="0.1"
          placeholder="36.5"
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
        />

        {/* O2 */}
        <InputField
          label="O₂ Saturatie (%)"
          type="number"
          placeholder="97"
          value={o2}
          onChange={(e) => setO2(e.target.value)}
        />

        {/* Photo */}
        <div style={{ marginBottom: 14 }}>
          {photo ? (
            <div
              style={{
                background: COLORS.greenLight,
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: COLORS.green, fontSize: 18 }}>📷 ✓</span>
              <span style={{ fontSize: 14, color: COLORS.green, fontWeight: 600 }}>
                Gesimuleerde foto bijgevoegd
              </span>
            </div>
          ) : (
            <button
              onClick={() => setPhoto(true)}
              style={{
                background: COLORS.white,
                border: `1px dashed ${COLORS.grey200}`,
                borderRadius: 8,
                padding: "14px 16px",
                width: "100%",
                fontSize: 14,
                color: COLORS.grey600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>📷</span>
              Foto toevoegen (optioneel)
            </button>
          )}
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.grey800,
              marginBottom: 6,
            }}
          >
            Notitie (optioneel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Eventuele opmerkingen voor de arts..."
            style={{
              border: `1px solid ${COLORS.grey200}`,
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 15,
              width: "100%",
              boxSizing: "border-box",
              fontFamily: "'DM Sans', sans-serif",
              resize: "none",
              outline: "none",
            }}
          />
        </div>

        <PrimaryButton onClick={onSubmit} disabled={!allFilled}>
          Versturen →
        </PrimaryButton>
      </div>
    </div>
  );
}

function SupplementConfirmScreen({ onBack }) {
  return (
    <div>
      <SessionHeader />
      <SuccessScreen
        title="Verstuurd"
        subtitle="De arts is op de hoogte gesteld."
        onBack={onBack}
      />
    </div>
  );
}

function VideoPreQuestionsScreen({ onBack, onSubmit }) {
  const [answers, setAnswers] = useState(["", "", ""]);

  const update = (i, val) => {
    const next = [...answers];
    next[i] = val;
    setAnswers(next);
  };

  const allFilled = answers.every((a) => a.trim() !== "");

  return (
    <div>
      <BackHeader label="Video-oproep · #2839 · Wond" onBack={onBack} />
      <SessionHeader />

      <div style={{ padding: "20px 20px 40px" }}>
        <p style={{ fontSize: 15, color: COLORS.grey600, marginBottom: 20, lineHeight: 1.5 }}>
          Beantwoord eerst deze vragen van de arts:
        </p>

        {PHYSICIAN_REQUESTS[1].vragen.map((q, i) => (
          <InputField
            key={i}
            label={q}
            type={i === 2 ? "number" : "text"}
            min={i === 2 ? "1" : undefined}
            max={i === 2 ? "10" : undefined}
            placeholder={i === 2 ? "1–10" : ""}
            value={answers[i]}
            onChange={(e) => update(i, e.target.value)}
          />
        ))}

        <div style={{ marginTop: 12 }}>
          <PrimaryButton onClick={onSubmit} disabled={!allFilled}>
            Versturen en oproep starten →
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function VideoInCallScreen({ onEnd }) {
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rearCamera, setRearCamera] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Timer */}
      <div style={{ textAlign: "center", padding: "20px 0 12px" }}>
        <div style={{ color: COLORS.green, fontSize: 14, fontWeight: 600 }}>
          Verbonden · {mm}:{ss}
        </div>
      </div>

      {/* Video areas */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, padding: "0 16px" }}>
        <div
          style={{
            flex: 1,
            background: "#2a2a2a",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>👨‍⚕️</div>
          <div style={{ color: COLORS.grey400, fontSize: 14 }}>Arts</div>
        </div>
        <div
          style={{
            flex: 1,
            background: "#333",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
            position: "relative",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
          <div style={{ color: COLORS.grey400, fontSize: 14 }}>
            U {rearCamera ? "(achter)" : "(voor)"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          padding: "24px 0 40px",
        }}
      >
        <button
          onClick={() => setMuted(!muted)}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: muted ? COLORS.orange : "#444",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Dempen"
        >
          🔇
        </button>
        <button
          onClick={() => setRearCamera(!rearCamera)}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#444",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Camera wisselen"
        >
          🔄
        </button>
        <button
          onClick={onEnd}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: COLORS.red,
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Oproep beëindigen"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── DCR Wizard ──────────────────────────────────────────────────

const KLACHT_OPTIONS = [
  "Overlijden",
  "Medicatievraag",
  "Bestaande klacht >48u",
  "Wond",
  "Ademhaling",
  "Anders",
];
const URGENTIE_OPTIONS = ["Acuut", "Urgent", "Semi-urgent", "Routine"];

function DCRStepIndicator({ step }) {
  const labels = ["Patiënt", "Klacht + Urgentie", "Controles", "Overzicht"];
  return (
    <div style={{ padding: "16px 20px 0" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.grey600, marginBottom: 8 }}>
        Stap {step} van 4 ·{" "}
        <span style={{ color: COLORS.orange, fontWeight: 700 }}>{labels[step - 1]}</span>
      </div>
      <div
        style={{
          height: 4,
          background: COLORS.grey100,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(step / 4) * 100}%`,
            background: COLORS.orange,
            borderRadius: 2,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function NVTToggle({ active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        background: active ? COLORS.grey200 : COLORS.white,
        border: `1px solid ${active ? COLORS.grey400 : COLORS.grey200}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 14,
        fontWeight: 600,
        color: active ? COLORS.grey600 : COLORS.grey400,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        minWidth: 56,
        transition: "all 0.2s",
      }}
    >
      n.v.t.
    </button>
  );
}

function DCRWizardScreen({ onBack, onSubmit }) {
  const [step, setStep] = useState(1);

  // Step 1
  const [initialen, setInitialen] = useState("");
  const [afdeling, setAfdeling] = useState("");
  const [geboortedatum, setGeboortedatum] = useState("");
  const [terugbel, setTerugbel] = useState(INSTITUTION.ivr);
  const [naam, setNaam] = useState("");

  // Step 2
  const [klacht, setKlacht] = useState("");
  const [klachtVrij, setKlachtVrij] = useState("");
  const [sindswanneer, setSindswanneer] = useState("");
  const [urgentie, setUrgentie] = useState("");

  // Step 3
  const [bp1, setBp1] = useState("");
  const [bp2, setBp2] = useState("");
  const [bpNvt, setBpNvt] = useState(false);
  const [temp, setTemp] = useState("");
  const [tempNvt, setTempNvt] = useState(false);
  const [o2, setO2] = useState("");
  const [o2Nvt, setO2Nvt] = useState(false);
  const [pols, setPols] = useState("");
  const [polsNvt, setPolsNvt] = useState(false);

  const step1Valid = initialen.trim() && afdeling.trim() && geboortedatum && terugbel.trim();
  const step2Valid = (klacht || klachtVrij.trim()) && sindswanneer && urgentie && urgentie !== "Acuut";
  const isAcuut = urgentie === "Acuut";

  const renderStep1 = () => (
    <div style={{ padding: "20px" }}>
      <InputField
        label="Initialen"
        placeholder="J.K."
        maxLength={5}
        value={initialen}
        onChange={(e) => setInitialen(e.target.value)}
      />
      <InputField
        label="Afdeling / Kamer"
        placeholder="Unit 3A"
        value={afdeling}
        onChange={(e) => setAfdeling(e.target.value)}
      />
      <InputField
        label="Geboortedatum"
        type="date"
        value={geboortedatum}
        onChange={(e) => setGeboortedatum(e.target.value)}
      />
      <InputField
        label="Terugbelnummer"
        type="tel"
        value={terugbel}
        onChange={(e) => setTerugbel(e.target.value)}
      />
      <InputField
        label="Uw naam (optioneel)"
        placeholder="Voor terugbelcontact en overdracht"
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
        filled={false}
      />
      <PrimaryButton onClick={() => setStep(2)} disabled={!step1Valid}>
        Volgende →
      </PrimaryButton>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.grey800,
            marginBottom: 8,
          }}
        >
          Hoofdklacht
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {KLACHT_OPTIONS.map((k) => (
            <button
              key={k}
              onClick={() => { setKlacht(k); setKlachtVrij(""); }}
              style={{
                background: klacht === k ? COLORS.orangePale : COLORS.white,
                border: `1px solid ${klacht === k ? COLORS.orange : COLORS.grey200}`,
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 14,
                fontWeight: klacht === k ? 600 : 400,
                color: klacht === k ? COLORS.orange : COLORS.grey800,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {k}
            </button>
          ))}
        </div>
        {klacht === "Anders" && (
          <InputField
            placeholder="Omschrijf de klacht..."
            value={klachtVrij}
            onChange={(e) => setKlachtVrij(e.target.value)}
          />
        )}
      </div>

      <InputField
        label="Sinds wanneer?"
        type="datetime-local"
        value={sindswanneer}
        onChange={(e) => setSindswanneer(e.target.value)}
      />

      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.grey800,
            marginBottom: 8,
          }}
        >
          Urgentie
        </label>
        <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${COLORS.grey200}` }}>
          {URGENTIE_OPTIONS.map((u) => (
            <button
              key={u}
              onClick={() => setUrgentie(u)}
              style={{
                flex: 1,
                padding: "12px 4px",
                fontSize: 13,
                fontWeight: urgentie === u ? 700 : 400,
                border: "none",
                borderRight: u !== "Routine" ? `1px solid ${COLORS.grey200}` : "none",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
                background:
                  urgentie === u
                    ? u === "Acuut"
                      ? COLORS.red
                      : COLORS.orange
                    : COLORS.white,
                color:
                  urgentie === u
                    ? COLORS.white
                    : u === "Acuut"
                    ? COLORS.red
                    : COLORS.grey800,
              }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Acute warning */}
      {isAcuut && (
        <div
          style={{
            background: COLORS.redLight,
            border: `2px solid ${COLORS.red}`,
            borderRadius: 10,
            padding: "16px",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.red, marginBottom: 6 }}>
            ⚠️ Bel direct: {INSTITUTION.ivr}
          </div>
          <a
            href={`tel:${INSTITUTION.ivr.replace(/[\s-]/g, "")}`}
            style={{
              display: "inline-block",
              background: COLORS.red,
              color: COLORS.white,
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              marginTop: 4,
            }}
          >
            Bel nu
          </a>
        </div>
      )}

      <PrimaryButton onClick={() => setStep(3)} disabled={!step2Valid}>
        Volgende →
      </PrimaryButton>
    </div>
  );

  const renderMeasurementRow = (label, val, setVal, nvt, setNvt, placeholder, extra) => (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.grey800,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {extra || (
          <input
            type="number"
            placeholder={placeholder}
            value={nvt ? "" : val}
            disabled={nvt}
            onChange={(e) => setVal(e.target.value)}
            style={{
              border: !nvt && val
                ? `2px solid ${COLORS.orange}`
                : `1px solid ${COLORS.grey200}`,
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 18,
              flex: 1,
              boxSizing: "border-box",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              opacity: nvt ? 0.4 : 1,
            }}
          />
        )}
        <NVTToggle active={nvt} onToggle={() => setNvt(!nvt)} />
        {!nvt && val && (
          <span style={{ color: COLORS.green, fontSize: 18, fontWeight: 700 }}>✓</span>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          background: COLORS.blueLight,
          borderRadius: 8,
          padding: "12px 14px",
          fontSize: 13,
          color: COLORS.blue,
          marginBottom: 20,
          lineHeight: 1.4,
        }}
      >
        Vul alvast de metingen in. Dit voorkomt een terugbelverzoek.
      </div>

      {renderMeasurementRow(
        "Bloeddruk",
        null,
        null,
        bpNvt,
        setBpNvt,
        null,
        <div style={{ display: "flex", gap: 8, flex: 1, alignItems: "center" }}>
          <input
            type="number"
            placeholder="Syst."
            value={bpNvt ? "" : bp1}
            disabled={bpNvt}
            onChange={(e) => setBp1(e.target.value)}
            style={{
              border: !bpNvt && bp1
                ? `2px solid ${COLORS.orange}`
                : `1px solid ${COLORS.grey200}`,
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 18,
              flex: 1,
              boxSizing: "border-box",
              textAlign: "center",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              opacity: bpNvt ? 0.4 : 1,
            }}
          />
          <span style={{ color: COLORS.grey400 }}>/</span>
          <input
            type="number"
            placeholder="Diast."
            value={bpNvt ? "" : bp2}
            disabled={bpNvt}
            onChange={(e) => setBp2(e.target.value)}
            style={{
              border: !bpNvt && bp2
                ? `2px solid ${COLORS.orange}`
                : `1px solid ${COLORS.grey200}`,
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 18,
              flex: 1,
              boxSizing: "border-box",
              textAlign: "center",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              opacity: bpNvt ? 0.4 : 1,
            }}
          />
        </div>
      )}
      {renderMeasurementRow("Temperatuur (°C)", temp, setTemp, tempNvt, setTempNvt, "36.5")}
      {renderMeasurementRow("O₂ Saturatie (%)", o2, setO2, o2Nvt, setO2Nvt, "97")}
      {renderMeasurementRow("Pols (bpm)", pols, setPols, polsNvt, setPolsNvt, "72")}

      <PrimaryButton onClick={() => setStep(4)}>
        Volgende →
      </PrimaryButton>
    </div>
  );

  const renderStep4 = () => {
    const klachtLabel = klacht === "Anders" ? klachtVrij : klacht;
    const formatDate = (d) => {
      if (!d) return "—";
      try {
        return new Date(d).toLocaleDateString("nl-NL");
      } catch {
        return d;
      }
    };
    const formatDateTime = (d) => {
      if (!d) return "—";
      try {
        return new Date(d).toLocaleString("nl-NL", {
          dateStyle: "short",
          timeStyle: "short",
        });
      } catch {
        return d;
      }
    };

    const SummaryRow = ({ label, value }) => (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 0",
          borderBottom: `1px solid ${COLORS.grey100}`,
          fontSize: 14,
        }}
      >
        <span style={{ color: COLORS.grey600 }}>{label}</span>
        <span style={{ fontWeight: 600, color: COLORS.grey900, textAlign: "right", maxWidth: "55%" }}>
          {value || "—"}
        </span>
      </div>
    );

    const meting = (label, val, nvt) =>
      nvt ? "n.v.t." : val || "—";

    return (
      <div style={{ padding: "20px" }}>
        <Card>
          <h4 style={{ fontSize: 13, color: COLORS.grey400, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>
            Patiënt
          </h4>
          <SummaryRow label="Initialen" value={initialen} />
          <SummaryRow label="Afdeling / Kamer" value={afdeling} />
          <SummaryRow label="Geboortedatum" value={formatDate(geboortedatum)} />
          <SummaryRow label="Terugbelnummer" value={terugbel} />
          {naam && <SummaryRow label="Uw naam" value={naam} />}
        </Card>

        <Card>
          <h4 style={{ fontSize: 13, color: COLORS.grey400, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>
            Klacht + Urgentie
          </h4>
          <SummaryRow label="Hoofdklacht" value={klachtLabel} />
          <SummaryRow label="Sinds wanneer" value={formatDateTime(sindswanneer)} />
          <SummaryRow label="Urgentie" value={urgentie} />
        </Card>

        <Card>
          <h4 style={{ fontSize: 13, color: COLORS.grey400, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>
            Controles
          </h4>
          <SummaryRow
            label="Bloeddruk"
            value={bpNvt ? "n.v.t." : bp1 && bp2 ? `${bp1}/${bp2}` : "—"}
          />
          <SummaryRow label="Temperatuur" value={meting("", temp, tempNvt)} />
          <SummaryRow label="O₂ Saturatie" value={meting("", o2, o2Nvt)} />
          <SummaryRow label="Pols" value={meting("", pols, polsNvt)} />
        </Card>

        <PrimaryButton onClick={onSubmit}>
          Aanvraag versturen →
        </PrimaryButton>
      </div>
    );
  };

  return (
    <div>
      <BackHeader
        label={`Nieuwe consultaanvraag`}
        onBack={step > 1 ? () => setStep(step - 1) : onBack}
      />
      <SessionHeader />
      <DCRStepIndicator step={step} />

      <ScreenTransition viewKey={step}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScreenTransition>
    </div>
  );
}

function DCRConfirmScreen({ onBack }) {
  return (
    <div>
      <SessionHeader />
      <SuccessScreen
        title="Aanvraag ingediend"
        subtitle={
          <>
            De arts wordt gewaarschuwd.
            <br />
            <span style={{ fontWeight: 700, color: COLORS.grey800 }}>Consult #2851</span>
            <br />
            <br />
            <span style={{ fontSize: 13, color: COLORS.grey400 }}>
              Wil je later metingen toevoegen? De arts stuurt je een aanvullingsverzoek.
            </span>
          </>
        }
        onBack={onBack}
      />
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────

export default function StartPortal() {
  const [view, setView] = useState(VIEW.QR_ENTRY);
  const [showEmpty, setShowEmpty] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [hasScannedBefore, setHasScannedBefore] = useState(false);

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  }, []);

  const navigate = useCallback((v) => setView(v), []);

  const renderView = () => {
    switch (view) {
      case VIEW.QR_ENTRY:
        return (
          <QREntryScreen
            hasOpenRequest={hasScannedBefore}
            onScan={() => {
              setHasScannedBefore(true);
              navigate(VIEW.DASHBOARD);
            }}
          />
        );

      case VIEW.DASHBOARD:
        return (
          <DashboardScreen
            onNavigate={navigate}
            showEmpty={showEmpty}
            onToggleEmpty={() => setShowEmpty(!showEmpty)}
          />
        );

      case VIEW.SUPPLEMENT_FORM:
        return (
          <SupplementFormScreen
            onBack={() => navigate(VIEW.DASHBOARD)}
            onSubmit={() => navigate(VIEW.SUPPLEMENT_CONFIRM)}
          />
        );

      case VIEW.SUPPLEMENT_CONFIRM:
        return (
          <SupplementConfirmScreen
            onBack={() => navigate(VIEW.DASHBOARD)}
          />
        );

      case VIEW.VIDEO_PREQUESTIONS:
        return (
          <VideoPreQuestionsScreen
            onBack={() => navigate(VIEW.DASHBOARD)}
            onSubmit={() => navigate(VIEW.VIDEO_INCALL)}
          />
        );

      case VIEW.VIDEO_INCALL:
        return (
          <VideoInCallScreen
            onEnd={() => {
              navigate(VIEW.DASHBOARD);
              showToast("Oproep beëindigd");
            }}
          />
        );

      case VIEW.DCR_WIZARD:
        return (
          <DCRWizardScreen
            onBack={() => navigate(VIEW.DASHBOARD)}
            onSubmit={() => navigate(VIEW.DCR_CONFIRM)}
          />
        );

      case VIEW.DCR_CONFIRM:
        return (
          <DCRConfirmScreen
            onBack={() => navigate(VIEW.DASHBOARD)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <FontLoader />
      <AppShell>
        <ScreenTransition viewKey={view}>
          {renderView()}
        </ScreenTransition>
        <Toast message={toast.message} visible={toast.visible} />
      </AppShell>
    </>
  );
}
