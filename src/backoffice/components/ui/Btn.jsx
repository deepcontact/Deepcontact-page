import Ico from "./Ico";

export default function Btn({ children, variant = "primary", icon, loading, size = "md", ...props }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 6, cursor: props.disabled ? "not-allowed" : "pointer",
    opacity: props.disabled ? 0.45 : 1, border: "none",
    fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
    transition: "all 0.15s ease", outline: "none",
    whiteSpace: "nowrap",
  };
  const sizes = {
    sm: { padding: "5px 12px", fontSize: 12, borderRadius: 6 },
    md: { padding: "8px 16px", fontSize: 13, borderRadius: 7 },
    lg: { padding: "11px 22px", fontSize: 14, borderRadius: 8 },
  };
  const variants = {
    primary:  { background: "#1e40af", color: "#fff", boxShadow: "0 1px 3px rgba(30,64,175,0.3)" },
    secondary:{ background: "#fff", color: "#1e40af", border: "1px solid #bfdbfe" },
    ghost:    { background: "transparent", color: "#64748b", border: "1px solid #e2e8f0" },
    danger:   { background: "#fff", color: "#dc2626", border: "1px solid #fecaca" },
    warning:  { background: "#fff", color: "#d97706", border: "1px solid #fde68a" },
    success:  { background: "#fff", color: "#059669", border: "1px solid #a7f3d0" },
  };
  return (
    <button {...props} style={{ ...base, ...sizes[size], ...variants[variant], ...(props.style || {}) }}>
      {loading
        ? <span style={{ width: 13, height: 13, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
        : icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      }
      {children}
    </button>
  );
}
