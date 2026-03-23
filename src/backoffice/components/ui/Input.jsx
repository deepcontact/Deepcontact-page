import { useState } from "react";
import Label from "./Label";

export default function Input({ label, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <Label>{label}</Label>}
      <input {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "#fff", border: `1.5px solid ${focused ? "#3b82f6" : "#d1d5db"}`,
          borderRadius: 7, padding: "9px 12px",
          color: "#111827", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          outline: "none", transition: "border-color 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
          ...(props.style || {}),
        }}
      />
    </div>
  );
}
