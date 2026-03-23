import { useState } from "react";
import { callEdge } from "../../api/supabase";
import Card from "../ui/Card";
import Btn from "../ui/Btn";
import Ico from "../ui/Ico";

const MAX_AGENTS = 5;

function WorkspaceCard({ ws, onUpdated }) {
  const [loading, setLoading]         = useState(false);
  const [retellData, setRetellData]   = useState(null); // { agents, phone_numbers }
  const [selectedAgent, setSelectedAgent] = useState(ws.retell_agent_id || "");
  const [selectedPhone, setSelectedPhone] = useState(ws.phone_number   || "");
  const [saving, setSaving]           = useState(false);
  const [testing, setTesting]         = useState(false);
  const [testMsg, setTestMsg]         = useState(null);
  const [error, setError]             = useState(null);

  // Agents management
  const [assignedAgentIds, setAssignedAgentIds] = useState(ws.retell_agent_ids || []);
  const [agentMgmtOpen, setAgentMgmtOpen]       = useState(null); // índice del slot abierto
  const [agentToAdd, setAgentToAdd]             = useState("");
  const [agentSaving, setAgentSaving]           = useState(false);

  const pct = Math.round(((ws.active_calls || 0) / (ws.max_concurrent || 20)) * 100);

  const handleFetchRetell = async () => {
    setLoading(true);
    setError(null);
    setRetellData(null);
    try {
      const data = await callEdge("manage-workspaces", { action: "fetch-retell", id: ws.id });
      setRetellData(data);
      if (!selectedAgent && data.agents?.length === 1) setSelectedAgent(data.agents[0].agent_id);
      if (!selectedPhone && data.phone_numbers?.length === 1) setSelectedPhone(data.phone_numbers[0].phone_number);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await callEdge("manage-workspaces", {
        action:          "update",
        id:              ws.id,
        retell_agent_id: selectedAgent || null,
        phone_number:    selectedPhone || null,
      });
      setRetellData(null);
      await onUpdated();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await callEdge("manage-workspaces", { action: "test", id: ws.id });
      setTestMsg({
        ok: res.valid,
        text: res.valid
          ? `API key válida · ${res.agent_count} agente(s)${res.agent_found === true ? " · agente OK" : res.agent_found === false ? " · agente no encontrado" : ""}`
          : `Error: ${res.error}`,
      });
    } catch (e) {
      setTestMsg({ ok: false, text: e.message });
    }
    setTesting(false);
  };

  const handleDeactivate = async () => {
    if (!window.confirm(`¿Desactivar el workspace "${ws.nombre}"?`)) return;
    try {
      await callEdge("manage-workspaces", { action: "delete", id: ws.id });
      await onUpdated();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAddAgentById = async (id) => {
    if (!id || assignedAgentIds.includes(id)) return;
    const newIds = [...assignedAgentIds, id];
    setAgentSaving(true);
    try {
      await callEdge("manage-workspaces", { action: "update", id: ws.id, retell_agent_ids: newIds });
      setAssignedAgentIds(newIds);
      setAgentToAdd("");
      setAgentMgmtOpen(null);
      await onUpdated();
    } catch (e) {
      setError(e.message);
    }
    setAgentSaving(false);
  };

  // eslint-disable-next-line no-unused-vars
  const handleAddAgent = async () => {
    if (!agentToAdd || assignedAgentIds.includes(agentToAdd)) return;
    const newIds = [...assignedAgentIds, agentToAdd];
    setAgentSaving(true);
    try {
      await callEdge("manage-workspaces", { action: "update", id: ws.id, retell_agent_ids: newIds });
      setAssignedAgentIds(newIds);
      setAgentToAdd("");
      setAgentMgmtOpen(null);
      await onUpdated();
    } catch (e) {
      setError(e.message);
    }
    setAgentSaving(false);
  };

  const handleRemoveAgent = async (agentId) => {
    const newIds = assignedAgentIds.filter((id) => id !== agentId);
    setAgentSaving(true);
    try {
      await callEdge("manage-workspaces", { action: "update", id: ws.id, retell_agent_ids: newIds });
      setAssignedAgentIds(newIds);
      await onUpdated();
    } catch (e) {
      setError(e.message);
    }
    setAgentSaving(false);
  };

  const getAgentName = (agentId) =>
    retellData?.agents?.find((a) => a.agent_id === agentId)?.agent_name || agentId;

  const configChanged = selectedAgent !== (ws.retell_agent_id || "") ||
                        selectedPhone  !== (ws.phone_number   || "");

  const availableToAdd = (retellData?.agents || []).filter(
    (a) => !assignedAgentIds.includes(a.agent_id),
  );

  return (
    <Card style={{ padding: 0, overflow: "hidden", opacity: ws.active ? 1 : 0.5 }}>
      {/* Franja superior */}
      <div style={{
        height: 3,
        background: !ws.active ? "#94a3b8" : ws.is_pending ? "#f59e0b" : "#10b981",
      }} />

      <div style={{ padding: "16px 18px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: ws.is_pending ? "#fffbeb" : "#eff6ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: ws.is_pending ? "#d97706" : "#1e40af",
            }}>
              <Ico name="server" size={17} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>
                {ws.nombre}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: !ws.active ? "#94a3b8" : ws.is_pending ? "#d97706" : "#10b981",
              }}>
                {!ws.active ? "Inactivo" : ws.is_pending ? "Pendiente · sin número" : "Listo"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn variant="ghost" size="sm" icon={<Ico name="refresh" size={12} />}
              loading={testing} onClick={handleTest}>
              Test
            </Btn>
            {ws.active && (
              <Btn variant="danger" size="sm" icon={<Ico name="x" size={12} />} onClick={handleDeactivate} />
            )}
          </div>
        </div>

        {/* Número */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 7 }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Número</div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: ws.phone_number ? "#0f172a" : "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ws.phone_number || "— sin número"}
            </div>
          </div>
        </div>

        {/* Barra de concurrencia */}
        {!ws.is_pending && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Concurrencia</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{ws.active_calls || 0}/{ws.max_concurrent} slots</span>
            </div>
            <div style={{ height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, transition: "width 0.4s", background: pct > 80 ? "#ef4444" : pct > 50 ? "#f59e0b" : "#10b981" }} />
            </div>
          </div>
        )}

        {/* ── Sección de Agentes ── */}
        {ws.active && !ws.is_pending && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Agentes ({assignedAgentIds.length}/{MAX_AGENTS})
              </span>
            </div>

            {/* 5 slots fijos */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {Array.from({ length: MAX_AGENTS }).map((_, i) => {
                const agentId = assignedAgentIds[i];
                const isSlotSelected = agentMgmtOpen === i;

                if (agentId) {
                  // Slot ocupado
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "6px 10px", background: "#f8fafc", borderRadius: 6,
                      border: "1px solid #e2e8f0", minHeight: 32,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1e40af", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#0f172a", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                          {getAgentName(agentId)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveAgent(agentId)}
                        disabled={agentSaving}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#ef4444", fontSize: 14, lineHeight: 1,
                          padding: "0 2px", opacity: agentSaving ? 0.5 : 1,
                        }}
                        title="Eliminar agente"
                      >×</button>
                    </div>
                  );
                }

                // Slot vacío
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "2px 6px", background: isSlotSelected ? "#eff6ff" : "#fafafa",
                    borderRadius: 6, border: `1.5px dashed ${isSlotSelected ? "#93c5fd" : "#e2e8f0"}`,
                    minHeight: 32, transition: "all 0.15s",
                  }}>
                    {isSlotSelected ? (
                      loading ? (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>Cargando...</span>
                      ) : retellData && availableToAdd.length === 0 ? (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>Sin agentes disponibles</span>
                      ) : retellData ? (
                        <select
                          autoFocus
                          value={agentToAdd}
                          onChange={(e) => { if (e.target.value) { setAgentToAdd(e.target.value); handleAddAgentById(e.target.value); } }}
                          onBlur={() => { setAgentMgmtOpen(null); setAgentToAdd(""); }}
                          style={{
                            width: "100%", padding: "4px 6px", border: "none",
                            background: "transparent", fontSize: 12,
                            fontFamily: "'DM Sans', sans-serif", color: "#0f172a",
                            outline: "none", cursor: "pointer",
                          }}
                        >
                          <option value="">— Seleccionar agente</option>
                          {availableToAdd.map((a) => (
                            <option key={a.agent_id} value={a.agent_id}>{a.agent_name}</option>
                          ))}
                        </select>
                      ) : null
                    ) : (
                      <button
                        onClick={() => { setAgentMgmtOpen(i); setAgentToAdd(""); if (!retellData) handleFetchRetell(); }}
                        disabled={agentSaving}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          background: "none", border: "none", cursor: "pointer", width: "100%",
                          color: "#cbd5e1", fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500, padding: "4px 0",
                        }}
                      >
                        <Ico name="plus" size={10} /> Vacío
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mensaje de test */}
        {testMsg && (
          <div style={{ padding: "7px 10px", borderRadius: 6, marginBottom: 10, background: testMsg.ok ? "#ecfdf5" : "#fef2f2", border: `1px solid ${testMsg.ok ? "#bbf7d0" : "#fecaca"}` }}>
            <span style={{ fontSize: 11, color: testMsg.ok ? "#059669" : "#dc2626", fontWeight: 600 }}>{testMsg.text}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "7px 10px", borderRadius: 6, marginBottom: 10, background: "#fef2f2", border: "1px solid #fecaca" }}>
            <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Botón cargar de Retell (solo para workspace pendiente) */}
        {ws.active && ws.is_pending && (
          <div>
            <Btn variant="ghost" size="sm" icon={<Ico name="refresh" size={12} />}
              loading={loading} onClick={handleFetchRetell}
              style={{ width: "100%", justifyContent: "center", marginBottom: retellData ? 10 : 0 }}>
              {retellData ? "Recargar" : "Cargar agentes y números"}
            </Btn>

            {retellData && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Selector agente */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
                    Agente ({retellData.agents.length} disponibles)
                  </div>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 7,
                      border: "1px solid #e2e8f0", background: "#fff",
                      fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#0f172a",
                    }}
                  >
                    <option value="">— Seleccionar agente</option>
                    {retellData.agents.map((a) => (
                      <option key={a.agent_id} value={a.agent_id}>{a.agent_name}</option>
                    ))}
                  </select>
                </div>

                {/* Selector número */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
                    Número de teléfono ({retellData.phone_numbers.length} disponibles)
                    {retellData.phone_numbers.length === 0 && (
                      <span style={{ color: "#f59e0b", marginLeft: 6 }}>· sin números en esta cuenta</span>
                    )}
                  </div>
                  {retellData.phone_numbers.length > 0 ? (
                    <select
                      value={selectedPhone}
                      onChange={(e) => setSelectedPhone(e.target.value)}
                      style={{
                        width: "100%", padding: "8px 10px", borderRadius: 7,
                        border: "1px solid #e2e8f0", background: "#fff",
                        fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#0f172a",
                      }}
                    >
                      <option value="">— Sin número (quedará pendiente)</option>
                      {retellData.phone_numbers.map((p) => (
                        <option key={p.phone_number} value={p.phone_number}>
                          {p.phone_number}{p.nickname ? ` · ${p.nickname}` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: "8px 10px", background: "#fffbeb", borderRadius: 7, border: "1px solid #fde68a" }}>
                      <span style={{ fontSize: 11, color: "#92400e" }}>
                        Esta cuenta no tiene números configurados. El workspace quedará pendiente hasta que se agregue uno.
                      </span>
                    </div>
                  )}
                </div>

                {configChanged && (
                  <Btn variant="primary" size="sm" loading={saving} onClick={handleSave}
                    icon={<Ico name="check" size={12} />}>
                    Guardar configuración
                  </Btn>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function WorkspacesView({ workspaces, onReload }) {
  const activeWs    = workspaces.filter((w) => w.active);
  const readyWs     = activeWs.filter((w) => !w.is_pending);
  const pendingWs   = activeWs.filter((w) => w.is_pending);
  const totalSlots  = readyWs.reduce((s, w) => s + (w.max_concurrent || 20), 0);

  return (
    <>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 26 }}>
        {[
          { label: "Total workspaces", value: workspaces.length, icon: "server", color: "#1e40af", light: "#eff6ff" },
          { label: "Listos",           value: readyWs.length,    icon: "check",  color: "#059669", light: "#ecfdf5" },
          { label: "Pendientes",       value: pendingWs.length,  icon: "clock",  color: "#d97706", light: "#fffbeb" },
          { label: "Slots disponibles",value: `${totalSlots}`,   icon: "phone",  color: "#7c3aed", light: "#f5f3ff" },
        ].map((k) => (
          <Card key={k.label} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>{k.value}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: k.light, display: "flex", alignItems: "center", justifyContent: "center", color: k.color, flexShrink: 0 }}>
                <Ico name={k.icon} size={17} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Instrucción */}
      <div style={{ padding: "12px 16px", background: "#f0f9ff", borderRadius: 9, border: "1px solid #bae6fd", marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#0369a1", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
          <strong>Para agregar un workspace:</strong> contactá al soporte técnico para configurar una nueva línea. Una vez creado, aparecerá acá y podrás asignarle agentes y número.
        </p>
      </div>

      {/* Botón recargar */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn variant="ghost" size="sm" icon={<Ico name="refresh" size={13} />} onClick={onReload}>
          Actualizar lista
        </Btn>
      </div>

      {/* Grid */}
      {workspaces.length === 0 ? (
        <Card style={{ padding: "48px 20px", textAlign: "center" }}>
          <div style={{ color: "#cbd5e1", display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Ico name="server" size={40} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>No hay workspaces configurados</p>
          <p style={{ fontSize: 13, color: "#cbd5e1" }}>
            Contactá al soporte técnico para configurar un workspace.
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws.id} ws={ws} onUpdated={onReload} />
          ))}
        </div>
      )}
    </>
  );
}
