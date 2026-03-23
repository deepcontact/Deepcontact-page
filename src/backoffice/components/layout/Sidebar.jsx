import { useState } from "react";
import Ico from "../ui/Ico";

const NAV_ITEMS = [
  { key: "dashboard",  icon: "grid",     label: "Dashboard" },
  { key: "campaigns",  icon: "flag",     label: "Campañas" },
  { key: "contacts",   icon: "users",    label: "Contactos" },
  { key: "agents",     icon: "agent",    label: "Agentes" },
  {
    key: "analytics", icon: "barChart", label: "Analíticas",
    children: [
      { key: "analytics-dashboard", label: "Dashboard" },
      { key: "analytics-logs",      label: "Logs" },
    ],
  },
  { key: "workspaces", icon: "server",   label: "Workspaces" },
  { key: "schedules",  icon: "clock",    label: "Horarios" },
];

export default function Sidebar({ activeView, onNavigate, onSettingsClick }) {
  const [expanded, setExpanded] = useState(activeView?.startsWith("analytics"));

  const isAnalyticsActive = activeView?.startsWith("analytics");

  const handleItemClick = (item) => {
    if (item.children) {
      setExpanded((prev) => !prev);
      // Si no hay sub-view activa aún, navegar al primero
      if (!activeView?.startsWith("analytics")) {
        onNavigate(item.children[0].key);
      }
    } else {
      onNavigate(item.key);
    }
  };

  return (
    <div style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: 220,
      background: "#0f172a", display: "flex", flexDirection: "column",
      borderRight: "1px solid #1e293b", zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onNavigate("dashboard")}>
          <div style={{ width: 34, height: 34, background: "#1e40af", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico name="phone" size={16} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.02em" }}>Contact</div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase" }}>Calls Manager</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const active    = activeView === item.key;
          const hasChildren = !!item.children;
          const isOpen    = hasChildren && expanded && isAnalyticsActive;

          return (
            <div key={item.key}>
              {/* Item principal */}
              <div onClick={() => handleItemClick(item)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 12px", borderRadius: 7, marginBottom: 2, cursor: "pointer",
                background: (active || (hasChildren && isAnalyticsActive)) ? "#1e293b" : "transparent",
                color: (active || (hasChildren && isAnalyticsActive)) ? "#f8fafc" : "#64748b",
                fontSize: 13, fontWeight: (active || (hasChildren && isAnalyticsActive)) ? 600 : 500,
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Ico name={item.icon} size={15} />
                  {item.label}
                </div>
                {hasChildren && (
                  <span style={{ fontSize: 10, color: "#475569", transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ▾
                  </span>
                )}
              </div>

              {/* Sub-items */}
              {hasChildren && isOpen && (
                <div style={{ marginBottom: 4 }}>
                  {item.children.map((child) => {
                    const childActive = activeView === child.key;
                    return (
                      <div key={child.key} onClick={() => onNavigate(child.key)} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 12px 7px 36px", borderRadius: 7, marginBottom: 1,
                        cursor: "pointer",
                        background: childActive ? "#1e3a5f" : "transparent",
                        color: childActive ? "#93c5fd" : "#475569",
                        fontSize: 12, fontWeight: childActive ? 600 : 500,
                        transition: "all 0.15s",
                      }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: childActive ? "#93c5fd" : "#334155", flexShrink: 0 }} />
                        {child.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "14px 10px", borderTop: "1px solid #1e293b" }}>
        <div onClick={onSettingsClick} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px", borderRadius: 7, cursor: "pointer",
          color: "#64748b", fontSize: 13, fontWeight: 500,
          transition: "all 0.15s",
        }}>
          <Ico name="settings" size={15} />
          Configuración
        </div>
      </div>
    </div>
  );
}
