export default function CSVTable({ rows }) {
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginTop: 14 }}>
      <div style={{ overflowX: "auto", maxHeight: 220 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {cols.map((c) => (
                <th key={c} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569", borderBottom: "1px solid #e2e8f0", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
                  {c.replace(/_/g, " ").toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 7).map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                {cols.map((c) => (
                  <td key={c} style={{ padding: "7px 12px", color: "#374151", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>{row[c] || "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 7 && (
        <div style={{ padding: "8px 12px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
          Mostrando 7 de {rows.length} filas
        </div>
      )}
    </div>
  );
}
