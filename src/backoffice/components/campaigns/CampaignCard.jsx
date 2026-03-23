import { useState } from "react";
import Ico from "../ui/Ico";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

// Formatea "2026-02-19" → "19 feb 2026"
function fmtDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CampaignCard({ c, agents, onAction }) {
  const [showStartWarning, setShowStartWarning] = useState(false);

  const agent = agents.find((a) => a.agent_id === c.agentId);
  const pct = c.contacts.length ? Math.round((c.called / c.contacts.length) * 100) : 0;

  const startDate = fmtDate(c.schedule?.startDate);
  const endDate   = fmtDate(c.schedule?.endDate);
  const scheduleLabel = startDate
    ? `${startDate}${endDate ? ` → ${endDate}` : ""}`
    : "—";

  // "creada" en DB = campaña nunca iniciada
  const neverStarted = c.state === "creada";

  // Campaña con fecha futura = lanzamiento automático pendiente
  const today = new Date().toISOString().split("T")[0];
  const isAutoScheduled = neverStarted && c.schedule?.startDate && c.schedule.startDate > today;

  return (
    <Card style={{ padding: 0, overflow: "hidden", transition: "box-shadow 0.2s" }}>
      <div style={{ height: 3, background: c.status === "active" ? "#10b981" : c.status === "scheduled" ? "#3b82f6" : c.status === "paused" ? "#f59e0b" : c.status === "completed" ? "#8b5cf6" : "#e2e8f0" }} />
      <div style={{ padding: "18px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3, marginBottom: 3 }}>{c.name}</h3>
            <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
              <Ico name="agent" size={11} />
              {agent?.agent_name || "Sin agente asignado"}
            </div>
          </div>
          <Badge status={c.status} />
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>Progreso de llamadas</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`, borderRadius: 99, transition: "width 0.5s ease",
              background: c.status === "active" ? "linear-gradient(90deg,#1e40af,#3b82f6)" : "#cbd5e1",
            }} />
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Contactos", value: c.contacts.length.toLocaleString() },
            { label: "Realizadas", value: c.called.toLocaleString() },
            { label: "Pendientes", value: (c.contacts.length - c.called).toLocaleString() },
          ].map((s) => (
            <div key={s.label} style={{ background: "#f8fafc", borderRadius: 7, padding: "9px 10px", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Workspace + batch status */}
        {c.workspaceCount > 0 && (
          <div style={{ padding: "6px 12px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Ico name="server" size={12} />
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              {c.workspaceCount} workspace{c.workspaceCount !== 1 ? "s" : ""}
            </span>
            {(c.batchSummary || []).map((b) => (
              <div key={b.batch_number} title={`Batch ${b.batch_number}: ${b.status} (intento ${b.attempt})`}
                style={{
                  width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                  background: {
                    queued:        "#94a3b8",
                    in_progress:   "#3b82f6",
                    waiting_retry: "#f59e0b",
                    completed:     "#10b981",
                  }[b.status] ?? "#e2e8f0",
                }}
              />
            ))}
          </div>
        )}

        {/* Schedule info */}
        <div style={{ padding: "9px 12px", background: "#f8fafc", borderRadius: 7, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Ico name="clock" size={13} />
          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
            {scheduleLabel} · {c.schedule?.startTime}–{c.schedule?.endTime} · {c.schedule?.callsPerMinute} llamadas/min
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {c.status === "scheduled" && neverStarted && (
            <Btn
              variant="primary"
              size="sm"
              icon={<Ico name="play" size={12} />}
              onClick={() => isAutoScheduled ? setShowStartWarning(true) : onAction("start", c.id)}
              style={isAutoScheduled ? { opacity: 0.45, cursor: "pointer" } : {}}
            >
              Iniciar
            </Btn>
          )}
          {c.status === "active" && (
            <Btn variant="warning" size="sm" icon={<Ico name="pause" size={12} />} onClick={() => onAction("pause", c.id)}>Pausar</Btn>
          )}
          {c.status === "paused" && (
            <Btn variant="success" size="sm" icon={<Ico name="play" size={12} />} onClick={() => onAction("resume", c.id)}>Reanudar</Btn>
          )}
          <Btn variant="danger" size="sm" icon={<Ico name="trash" size={12} />} onClick={() => onAction("delete", c.id)}>Eliminar</Btn>
        </div>

        {/* Modal advertencia inicio manual */}
        {showStartWarning && (
          <div
            onClick={() => setShowStartWarning(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
              zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff", borderRadius: 14, padding: "28px 28px 22px",
                width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              }}
            >
              {/* Icono */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: "#fffbeb",
                border: "1px solid #fde68a", display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: 14, color: "#d97706",
              }}>
                <Ico name="clock" size={20} />
              </div>

              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>
                ¿Iniciar ahora?
              </h3>
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "#374151", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                Esta campaña está programada para lanzarse automáticamente el <strong>{startDate}</strong>.
              </p>
              <p style={{ margin: "0 0 22px", fontSize: 13, color: "#374151", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                Si la iniciás manualmente, <strong>comenzará a llamar en este momento</strong> y no respetará la fecha programada.
              </p>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Btn variant="ghost" onClick={() => setShowStartWarning(false)}>
                  Cancelar
                </Btn>
                <Btn
                  variant="primary"
                  icon={<Ico name="play" size={13} />}
                  onClick={() => { setShowStartWarning(false); onAction("start", c.id); }}
                >
                  Iniciar ahora igual
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
