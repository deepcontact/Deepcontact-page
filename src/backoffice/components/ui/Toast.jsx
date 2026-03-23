import Ico from "./Ico";

export default function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const cfg = {
    success: { bg: "#f0fdf4", border: "#86efac", icon: "✓", color: "#166534" },
    error:   { bg: "#fef2f2", border: "#fca5a5", icon: "✕", color: "#991b1b" },
    info:    { bg: "#eff6ff", border: "#93c5fd", icon: "i", color: "#1e40af" },
  }[type] || { bg: "#f8fafc", border: "#cbd5e1", icon: "i", color: "#334155" };
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 9, padding: "12px 16px",
      display: "flex", alignItems: "center", gap: 10,
      fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: cfg.color,
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)", maxWidth: 320,
    }}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: cfg.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: cfg.color, opacity: 0.6, padding: 2, display: "flex" }}>
        <Ico name="x" size={14} />
      </button>
    </div>
  );
}
