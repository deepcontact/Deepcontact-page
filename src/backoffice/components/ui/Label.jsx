export default function Label({ children }) {
  return (
    <label style={{
      display: "block", marginBottom: 5,
      fontSize: 12, fontWeight: 600, color: "#374151",
      fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em",
    }}>{children}</label>
  );
}
