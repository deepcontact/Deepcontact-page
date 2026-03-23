import { useState } from "react";
import Card from "../ui/Card";
import Btn from "../ui/Btn";
import Ico from "../ui/Ico";
import Badge from "../ui/Badge";

function fmtDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CampaignsView({ campaigns, agents, onAction, onNewCampaign }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = campaigns
    .filter((c) => filterStatus === "all" || c.status === filterStatus)
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const statuses = [
    { key: "all", label: "Todas" },
    { key: "active", label: "Activas" },
    { key: "scheduled", label: "Programadas" },
    { key: "paused", label: "Pausadas" },
    { key: "draft", label: "Borradores" },
    { key: "completed", label: "Completadas" },
  ];

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total", value: campaigns.length, color: "#1e40af", bg: "#eff6ff" },
          { label: "Activas", value: campaigns.filter((c) => c.status === "active").length, color: "#059669", bg: "#ecfdf5" },
          { label: "Pausadas", value: campaigns.filter((c) => c.status === "paused").length, color: "#d97706", bg: "#fffbeb" },
          { label: "Programadas", value: campaigns.filter((c) => c.status === "scheduled").length, color: "#3b82f6", bg: "#eff6ff" },
        ].map((k) => (
          <Card key={k.label} style={{ padding: "16px 18px" }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k.label}</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: k.color, letterSpacing: "-0.03em" }}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}>
              <Ico name="list" size={14} />
            </div>
            <input
              placeholder="Buscar campaña..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 32px", border: "1.5px solid #e2e8f0",
                borderRadius: 7, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                outline: "none", background: "#f8fafc", color: "#0f172a",
              }}
            />
          </div>
          {/* Status pills */}
          <div style={{ display: "flex", gap: 4 }}>
            {statuses.map((s) => (
              <button key={s.key} onClick={() => setFilterStatus(s.key)} style={{
                padding: "5px 12px", borderRadius: 99, border: "none", cursor: "pointer",
                background: filterStatus === s.key ? "#0f172a" : "#f1f5f9",
                color: filterStatus === s.key ? "#fff" : "#64748b",
                fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}>{s.label}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card style={{ padding: "52px 20px", textAlign: "center" }}>
          <div style={{ color: "#cbd5e1", display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Ico name="flag" size={40} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
            {search ? "Sin resultados" : "No hay campañas"}
          </p>
          <p style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 20 }}>
            {search ? "Probá con otro término de búsqueda" : "Creá tu primera campaña para empezar"}
          </p>
          {!search && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Btn variant="primary" icon={<Ico name="plus" size={14} />} onClick={onNewCampaign}>Nueva Campaña</Btn>
            </div>
          )}
        </Card>
      ) : (
        <Card style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Nombre", "Agente", "Estado", "Contactos", "Progreso", "Horario", "Acciones"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700,
                      color: "#64748b", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const agent = agents.find((a) => a.agent_id === c.agentId);
                  const pct = c.contacts.length ? Math.round((c.called / c.contacts.length) * 100) : 0;
                  const startDate = fmtDate(c.schedule?.startDate);
                  const endDate   = fmtDate(c.schedule?.endDate);
                  const scheduleLabel = startDate
                    ? `${startDate}${endDate ? ` → ${endDate}` : ""}`
                    : "—";
                  const neverStarted = c.state === "creada";
                  const expanded = expandedId === c.id;

                  return (
                    <tr key={c.id}
                      onClick={() => setExpandedId(expanded ? null : c.id)}
                      style={{
                        borderBottom: "1px solid #f1f5f9", cursor: "pointer",
                        background: expanded ? "#f8fafc" : "#fff",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = "#fafbfc"; }}
                      onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = "#fff"; }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>{c.name}</div>
                        {expanded && (
                          <div style={{ marginTop: 8, padding: "10px 12px", background: "#fff", borderRadius: 7, border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 8 }}>
                              <div>
                                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Realizadas</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{c.called}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Pendientes</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{c.contacts.length - c.called}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Velocidad</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{c.schedule?.callsPerMinute}/min</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              Horario: {c.schedule?.startTime}–{c.schedule?.endTime} · {scheduleLabel}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e40af", flexShrink: 0 }}>
                            <Ico name="agent" size={10} />
                          </div>
                          <span style={{ fontSize: 12, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>{agent?.agent_name?.split("—")[0]?.trim() || "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}><Badge status={c.status} /></td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>
                        {c.contacts.length.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 16px", minWidth: 120 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", width: `${pct}%`, borderRadius: 99,
                              background: c.status === "active" ? "linear-gradient(90deg,#1e40af,#3b82f6)" : "#cbd5e1",
                              transition: "width 0.5s",
                            }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", fontFamily: "'DM Sans', sans-serif", minWidth: 32 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
                        {scheduleLabel}
                      </td>
                      <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 5 }}>
                          {c.status === "scheduled" && neverStarted && (
                            <Btn variant="primary" size="sm" onClick={() => onAction("start", c.id)} icon={<Ico name="play" size={11} />}>Iniciar</Btn>
                          )}
                          {c.status === "active" && (
                            <Btn variant="warning" size="sm" onClick={() => onAction("pause", c.id)} icon={<Ico name="pause" size={11} />}>Pausar</Btn>
                          )}
                          {c.status === "paused" && (
                            <Btn variant="success" size="sm" onClick={() => onAction("resume", c.id)} icon={<Ico name="play" size={11} />}>Reanudar</Btn>
                          )}
                          <Btn variant="danger" size="sm" onClick={() => onAction("delete", c.id)} icon={<Ico name="trash" size={11} />} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
            {filtered.length} campaña{filtered.length !== 1 ? "s" : ""}
          </div>
        </Card>
      )}
    </div>
  );
}
