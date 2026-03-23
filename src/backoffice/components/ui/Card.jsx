export default function Card({ children, style }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10,
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}
