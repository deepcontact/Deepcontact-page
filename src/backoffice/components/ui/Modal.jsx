import Ico from "./Ico";

export default function Modal({ open, onClose, onOverlayClick, title, subtitle, children, width = 540 }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(15,23,42,0.4)", backdropFilter: "blur(3px)",
    }} onClick={(e) => e.target === e.currentTarget && (onOverlayClick ? onOverlayClick() : onClose())}>
      <div style={{
        background: "#fff", borderRadius: 12,
        width: "92%", maxWidth: width, maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>{title}</h3>
            {subtitle && <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: 6, cursor: "pointer", color: "#64748b", display: "flex", marginTop: 2 }}>
            <Ico name="x" size={14} />
          </button>
        </div>
        <div style={{ padding: 24, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
