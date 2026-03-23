import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { callEdge, SUPABASE_URL, SUPABASE_ANON_KEY } from "./api/supabase";
import Ico from "./components/ui/Ico";
import Btn from "./components/ui/Btn";
import Card from "./components/ui/Card";
import Toast from "./components/ui/Toast";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import CampaignCard from "./components/campaigns/CampaignCard";
import CreateWizard from "./components/campaigns/CreateWizard";
import SettingsModal from "./components/settings/SettingsModal";
import CampaignsView from "./components/views/CampaignsView";
import ContactsView from "./components/views/ContactsView";
import AgentsView from "./components/views/AgentsView";
import SchedulesView from "./components/views/SchedulesView";
import WorkspacesView from "./components/views/WorkspacesView";
import AnalyticsView from "./components/views/AnalyticsView";

// Mapeo bidireccional entre rutas URL y claves de vista
const ROUTE_TO_VIEW = {
  "/backoffice":                    "dashboard",
  "/backoffice/campaigns":          "campaigns",
  "/backoffice/contacts":           "contacts",
  "/backoffice/agents":             "agents",
  "/backoffice/analytics":          "analytics-dashboard",
  "/backoffice/analytics/dashboard":"analytics-dashboard",
  "/backoffice/analytics/logs":     "analytics-logs",
  "/backoffice/workspaces":         "workspaces",
  "/backoffice/schedules":          "schedules",
};
const VIEW_TO_ROUTE = {
  "dashboard":           "/backoffice",
  "campaigns":           "/backoffice/campaigns",
  "contacts":            "/backoffice/contacts",
  "agents":              "/backoffice/agents",
  "analytics-dashboard": "/backoffice/analytics/dashboard",
  "analytics-logs":      "/backoffice/analytics/logs",
  "workspaces":          "/backoffice/workspaces",
  "schedules":           "/backoffice/schedules",
};

export default function App() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const activeView = ROUTE_TO_VIEW[location.pathname] ?? "dashboard";
  const setActiveView = (view) => navigate(VIEW_TO_ROUTE[view] ?? "/backoffice");
  const [agents, setAgents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "info" });
  const [config, setConfig] = useState({ url: SUPABASE_URL, key: SUPABASE_ANON_KEY });
  const [tab, setTab] = useState("all");
  const importContactsRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "info" }), 3500);
  };

  // Carga workspaces desde la DB
  const loadWorkspaces = async () => {
    try {
      const data = await callEdge("manage-workspaces", { action: "list" });
      setWorkspaces(data.workspaces || []);
    } catch (e) {
      console.error("Error cargando workspaces:", e.message);
    }
  };

  // Carga campañas desde la DB con estadísticas
  // silent=true: actualiza datos sin mostrar spinner (para auto-refresh)
  const loadCampaigns = async (silent = false) => {
    if (!silent) setLoadingCampaigns(true);
    try {
      const data = await callEdge("get-campaigns", {});
      setCampaigns(data.campaigns || []);
    } catch (e) {
      if (!silent) showToast("Error al cargar campañas: " + e.message, "error");
    }
    if (!silent) setLoadingCampaigns(false);
  };

  // Carga agentes importados desde la DB local
  const loadLocalAgents = async () => {
    try {
      const data = await callEdge("retell-agents", { action: "local" });
      setAgents(data.agents || []);
    } catch (e) {
      console.error("Error cargando agentes:", e.message);
    }
  };

  // Sincroniza agentes de todos los workspaces activos (deduplicado por nombre)
  const loadAgents = async () => {
    setLoadingAgents(true);
    try {
      const result = await callEdge("retell-agents", { action: "sync-all" });
      if ((result.imported ?? 0) > 0) {
        showToast(`${result.imported} agente(s) sincronizados`, "success");
      } else {
        showToast("Agentes ya sincronizados", "info");
      }
      await loadLocalAgents();
    } catch (e) {
      showToast("Error al sincronizar agentes: " + e.message, "error");
    }
    setLoadingAgents(false);
  };

  const handleAction = async (action, id) => {
    const msgs = {
      start:  "Campaña iniciada correctamente",
      pause:  "Campaña pausada",
      resume: "Campaña reanudada",
      delete: "Campaña eliminada",
      finish: "Campaña finalizada",
    };
    try {
      await callEdge("campaign-action", { action, campaign_id: id });
      showToast(msgs[action], action === "delete" ? "error" : "success");
      await loadCampaigns();
    } catch (e) {
      showToast(e.message || "Error al ejecutar acción", "error");
    }
  };

  const handleSave = async (form) => {
    try {
      const result = await callEdge("create-campaign", {
        name:                 form.name,
        agentRetellId:        form.agentId,
        schedule:             form.schedule,
        contacts:             form.contacts,
        startMode:            form.startMode,
        workspaceIds:         form.workspaceIds || [],
        maxAttempts:          form.maxAttempts ?? 1,
        retryIntervalMinutes: form.retryIntervalMinutes ?? 0,
      });
      showToast(`Campaña "${form.name}" creada con ${result.contacts_inserted} contactos`, "success");
      await loadCampaigns();
    } catch (e) {
      showToast(e.message || "Error al crear campaña", "error");
    }
  };

  // Carga inicial al montar la app
  useEffect(() => {
    loadCampaigns();
    loadLocalAgents();
    loadWorkspaces();
  }, []);

  // Auto-refresh de campañas cada 15 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadCampaigns(true);
    }, 120_000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { key: "all", label: "Todas" },
    { key: "active", label: "Activas" },
    { key: "scheduled", label: "Programadas" },
    { key: "paused", label: "Pausadas" },
    { key: "draft", label: "Borradores" },
  ];
  const filtered = tab === "all" ? campaigns : campaigns.filter((c) => c.status === tab);

  const totalCalls = campaigns.reduce((s, c) => s + c.called, 0);
  const totalContacts = campaigns.reduce((s, c) => s + c.contacts.length, 0);
  const activeCount = campaigns.filter((c) => c.status === "active").length;

  const renderView = () => {
    switch (activeView) {
      case "campaigns":
        return <CampaignsView campaigns={campaigns} agents={agents} onAction={handleAction} onNewCampaign={() => setCreateOpen(true)} loading={loadingCampaigns} />;
      case "contacts":
        return <ContactsView campaigns={campaigns} agents={agents} onImportRef={importContactsRef} />;
      case "agents":
        return <AgentsView agents={agents} campaigns={campaigns} loadingAgents={loadingAgents} onSyncAgents={loadAgents} />;
      case "schedules":
        return <SchedulesView campaigns={campaigns} agents={agents} />;
      case "analytics-dashboard":
        return <AnalyticsView campaigns={campaigns} activeTab="dashboard" />;
      case "analytics-logs":
        return <AnalyticsView campaigns={campaigns} activeTab="logs" />;
      case "workspaces":
        return <WorkspacesView workspaces={workspaces} onReload={loadWorkspaces} />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 26 }}>
        {[
          { label: "Total campañas", value: campaigns.length, icon: "flag", color: "#1e40af", light: "#eff6ff" },
          { label: "Campañas activas", value: activeCount, icon: "play", color: "#059669", light: "#ecfdf5" },
          { label: "Total contactos", value: totalContacts.toLocaleString(), icon: "users", color: "#7c3aed", light: "#f5f3ff" },
          { label: "Llamadas realizadas", value: totalCalls.toLocaleString(), icon: "phone", color: "#d97706", light: "#fffbeb" },
        ].map((k) => (
          <Card key={k.label} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>{k.value}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: k.light, display: "flex", alignItems: "center", justifyContent: "center", color: k.color, flexShrink: 0 }}>
                <Ico name={k.icon} size={17} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AGENT STRIP */}
      <Card style={{ padding: "14px 18px", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Ico name="agent" size={14} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Agentes disponibles</span>
            <span style={{ fontSize: 11, color: "#94a3b8", background: "#f1f5f9", padding: "2px 7px", borderRadius: 99 }}>{agents.length}</span>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: agents.length ? "#10b981" : "#94a3b8", boxShadow: agents.length ? "0 0 0 2px #ecfdf5" : "none" }} />
        </div>
        {agents.length === 0 ? (
          <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
            No hay agentes importados. Hacé click en "Sincronizar Agentes" para importarlos.
          </p>
        ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {agents.map((a) => (
            <div key={a.agent_id} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 12px", background: "#f8fafc", borderRadius: 7,
              border: "1px solid #e2e8f0",
            }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e40af", flexShrink: 0 }}>
                <Ico name="agent" size={12} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{a.agent_name}</div>
              </div>
            </div>
          ))}
        </div>
        )}
      </Card>

      {/* CAMPAIGNS SECTION */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 2, background: "#fff", padding: "3px", borderRadius: 9, border: "1px solid #e2e8f0" }}>
          {tabs.map((t) => {
            const count = t.key === "all" ? campaigns.length : campaigns.filter((c) => c.status === t.key).length;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                  background: tab === t.key ? "#0f172a" : "transparent",
                  color: tab === t.key ? "#f8fafc" : "#64748b",
                  fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
                }}>
                {t.label}
                {count > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: tab === t.key ? "#1e293b" : "#f1f5f9",
                    color: tab === t.key ? "#94a3b8" : "#64748b",
                    padding: "1px 6px", borderRadius: 99,
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID */}
      {loadingCampaigns ? (
        <Card style={{ padding: "48px 20px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <span style={{ width: 28, height: 28, border: "3px solid #e2e8f0", borderTopColor: "#1e40af", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>Cargando campañas...</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card style={{ padding: "48px 20px", textAlign: "center" }}>
          <div style={{ color: "#cbd5e1", display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Ico name="flag" size={40} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>No hay campañas</p>
          <p style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 20 }}>Creá tu primera campaña para comenzar a gestionar llamadas</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Btn variant="primary" icon={<Ico name="plus" size={14} />} onClick={() => setCreateOpen(true)}>Nueva Campaña</Btn>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
          {filtered.map((c) => <CampaignCard key={c.id} c={c} agents={agents} onAction={handleAction} />)}
        </div>
      )}

    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f1f5f9; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        button:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        input[type="range"] { height: 4px; cursor: pointer; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>

        <Sidebar activeView={activeView} onNavigate={setActiveView} onSettingsClick={() => setSettingsOpen(true)} />

        {/* MAIN */}
        <div style={{ marginLeft: 220 }}>

          <Topbar
            activeView={activeView}
            loadingAgents={loadingAgents}
            onSyncAgents={loadAgents}
            onNewCampaign={() => setCreateOpen(true)}
            onImportContacts={() => importContactsRef.current?.()}
          />

          <div style={{ padding: "26px 28px" }}>
            {renderView()}
          </div>
        </div>
      </div>

      <CreateWizard open={createOpen} onClose={() => setCreateOpen(false)} agents={agents} onSave={handleSave} onDraftSaved={() => showToast("Borrador guardado. Se restaurará al abrir Nueva Campaña.", "info")} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} config={config} onSave={setConfig} />
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "info" })} />
    </>
  );
}
