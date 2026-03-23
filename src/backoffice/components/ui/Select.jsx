import Label from "./Label";

export default function Select({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <Label>{label}</Label>}
      <select {...props} style={{
        width: "100%", background: "#fff", border: "1.5px solid #d1d5db",
        borderRadius: 7, padding: "9px 12px", color: "#111827",
        fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", cursor: "pointer",
        ...(props.style || {}),
      }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
