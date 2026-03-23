import { STATUS } from "../../constants";

export default function Badge({ status }) {
  const s = STATUS[status] || STATUS.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: s.bg, color: s.text,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}
