import Ico from "../ui/Ico";

export default function StepBar({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28, gap: 0 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? "1" : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: i < current ? "#1e40af" : i === current ? "#eff6ff" : "#f8fafc",
              border: `2px solid ${i <= current ? "#1e40af" : "#e2e8f0"}`,
              fontSize: 11, fontWeight: 700, color: i < current ? "#fff" : i === current ? "#1e40af" : "#94a3b8",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {i < current ? <Ico name="check" size={12} /> : i + 1}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: i === current ? "#1e40af" : "#94a3b8", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? "#1e40af" : "#e2e8f0", margin: "0 8px", marginTop: -18 }} />
          )}
        </div>
      ))}
    </div>
  );
}
