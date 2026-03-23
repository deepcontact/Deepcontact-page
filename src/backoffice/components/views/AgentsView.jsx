import { useState } from "react";
import Card from "../ui/Card";
import Btn from "../ui/Btn";
import Ico from "../ui/Ico";
import Modal from "../ui/Modal";
import Input from "../ui/Input";

export default function AgentsView({ agents, campaigns, loadingAgents, onSyncAgents }) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const getAgentStats = (agentId) => {
    const assigned = campaigns.filter((c) => c.agentId === agentId);
    const totalContacts = assigned.reduce((s, c) => s + c.contacts.length, 0);
    const totalCalled = assigned.reduce((s, c) => s + c.called, 0);
    const activeCampaigns = assigned.filter((c) => c.status === "active").length;
    return { assigned: assigned.length, activeCampaigns, totalContacts, totalCalled, campaigns: assigned };
  };

  const STATUS_COLORS = ["#10b981", "#f59e0b", "#94a3b8"];
  const STATUS_LABELS = ["Disponible", "Ocupado", "Offline"];

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total agentes", value: agents.length, color: "#1e40af", icon: "agent" },
          { label: "Con campañas activas", value: agents.filter((a) => campaigns.some((c) => c.agentId === a.agent_id && c.status === "active")).length, color: "#059669", icon: "play" },
          { label: "Sin asignar", value: agents.filter((a) => !campaigns.some((c) => c.agentId === a.agent_id)).length, color: "#94a3b8", icon: "clock" },
        ].map((k) => (
          <Card key={k.label} style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k.label}</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: k.color, letterSpacing: "-0.03em" }}>{k.value}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: k.color }}>
                <Ico name={k.icon} size={17} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sync bar */}
      <Card style={{ padding: "12px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 2px #ecfdf5" }} />
            <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
              Sistema de voz IA · {agents.length} agente{agents.length !== 1 ? "s" : ""} sincronizado{agents.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Btn variant="ghost" size="sm" icon={<Ico name="refresh" size={13} />} loading={loadingAgents} onClick={onSyncAgents}>
            Sincronizar
          </Btn>
        </div>
      </Card>

      {/* Agent cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {agents.map((a, idx) => {
          const stats = getAgentStats(a.agent_id);
          const statusIdx = stats.activeCampaigns > 0 ? 1 : stats.assigned > 0 ? 0 : 2;

          return (
            <Card key={a.agent_id} style={{ padding: 0, overflow: "hidden", transition: "box-shadow 0.2s, transform 0.2s" }}>
              {/* Color bar */}
              <div style={{ height: 3, background: STATUS_COLORS[statusIdx] }} />
              <div style={{ padding: "20px 22px" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#1e40af", flexShrink: 0, position: "relative",
                  }}>
                    <Ico name="agent" size={22} />
                    <div style={{
                      position: "absolute", bottom: -1, right: -1,
                      width: 12, height: 12, borderRadius: "50%",
                      background: STATUS_COLORS[statusIdx],
                      border: "2px solid #fff",
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>
                      {a.agent_name}
                    </h3>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                      background: statusIdx === 1 ? "#fffbeb" : statusIdx === 0 ? "#ecfdf5" : "#f8fafc",
                      color: STATUS_COLORS[statusIdx],
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{STATUS_LABELS[statusIdx]}</span>
                  </div>
                </div>

                {/* Voice info */}
                <div style={{
                  padding: "10px 12px", background: "#f8fafc", borderRadius: 8,
                  border: "1px solid #f1f5f9", marginBottom: 14,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Ico name="phone" size={13} />
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Voz</div>
                    <div style={{ fontSize: 12, color: "#374151", fontWeight: 500, fontFamily: "'DM Mono', monospace" }}>{a.voice_id}</div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Campañas", value: stats.assigned },
                    { label: "Contactos", value: stats.totalContacts.toLocaleString() },
                    { label: "Llamadas", value: stats.totalCalled.toLocaleString() },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center", padding: "8px 4px", background: "#f8fafc", borderRadius: 7 }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Assigned campaigns */}
                {stats.campaigns.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Campañas asignadas</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {stats.campaigns.map((c) => (
                        <div key={c.id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "6px 10px", background: "#fff", borderRadius: 6,
                          border: "1px solid #f1f5f9", fontSize: 12,
                        }}>
                          <span style={{ color: "#374151", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{c.name}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 99,
                            background: c.status === "active" ? "#ecfdf5" : c.status === "paused" ? "#fffbeb" : "#f1f5f9",
                            color: c.status === "active" ? "#059669" : c.status === "paused" ? "#d97706" : "#94a3b8",
                          }}>{c.status === "active" ? "Activa" : c.status === "paused" ? "Pausada" : c.status === "scheduled" ? "Prog." : "Borrador"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" size="sm" style={{ flex: 1 }} onClick={() => setSelectedAgent(a)}>
                    <Ico name="settings" size={12} />
                    <span style={{ marginLeft: 4 }}>Configurar</span>
                  </Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Agent config modal */}
      <Modal
        open={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.agent_name || ""}
        subtitle="Configuración del agente"
        width={480}
      >
        {selectedAgent && (
          <>
            <Input label="Nombre del agente" value={selectedAgent.agent_name} readOnly />
            <Input label="Agent ID" value={selectedAgent.agent_id} readOnly />
            <Input label="Voice ID" value={selectedAgent.voice_id} readOnly />
            <div style={{ padding: "12px 14px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#1e40af", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                La configuración avanzada del agente (prompt, voz, idioma) se gestiona a través del soporte técnico.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setSelectedAgent(null)}>Cerrar</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
