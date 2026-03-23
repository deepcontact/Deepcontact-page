import Ico from "../ui/Ico";
import Btn from "../ui/Btn";

const VIEW_CONFIG = {
  dashboard:  { title: "Panel de Campañas",     subtitle: null },
  campaigns:  { title: "Campañas",              subtitle: "Gestión y seguimiento de campañas de llamadas" },
  contacts:   { title: "Contactos",             subtitle: "Base de datos de contactos para campañas" },
  agents:               { title: "Agentes de Voz",  subtitle: "Agentes de voz IA configurados" },
  schedules:            { title: "Horarios",         subtitle: "Programación semanal de campañas" },
  workspaces:           { title: "Workspaces",       subtitle: "Gestión de líneas y números de teléfono" },
  "analytics-dashboard": { title: "Analíticas · Dashboard", subtitle: "Métricas y gráficos operativos" },
  "analytics-logs":      { title: "Analíticas · Logs",      subtitle: "Historial detallado de llamadas" },
};

export default function Topbar({ activeView, loadingAgents, onSyncAgents, onNewCampaign, onImportContacts }) {
  const cfg = VIEW_CONFIG[activeView] || VIEW_CONFIG.dashboard;

  return (
    <header style={{
      background: "#fff", borderBottom: "1px solid #e2e8f0",
      padding: "0 28px", height: 60,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 40,
    }}>
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>{cfg.title}</h1>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, marginTop: 1 }}>
          {cfg.subtitle || new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {(activeView === "dashboard" || activeView === "agents") && (
          <Btn variant="ghost" size="sm" icon={<Ico name="refresh" size={13} />} loading={loadingAgents} onClick={onSyncAgents}>
            Sincronizar Agentes
          </Btn>
        )}
        {(activeView === "dashboard" || activeView === "campaigns") && (
          <Btn variant="primary" size="sm" icon={<Ico name="plus" size={13} />} onClick={onNewCampaign}>
            Nueva Campaña
          </Btn>
        )}
        {activeView === "contacts" && (
          <Btn variant="primary" size="sm" icon={<Ico name="upload" size={13} />} onClick={onImportContacts}>
            Importar CSV
          </Btn>
        )}
      </div>
    </header>
  );
}
