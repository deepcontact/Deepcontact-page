import { useState } from "react";

// Ícono de ayuda ⓘ para usar junto a labels
export function InfoIcon({ style }) {
  return (
    <svg
      width={14} height={14} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ color: "#94a3b8", marginLeft: 5, cursor: "help", flexShrink: 0, ...style }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// Wrapper que muestra un tooltip oscuro al hacer hover sobre sus hijos
export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1e293b",
          color: "#f1f5f9",
          fontSize: 11,
          lineHeight: 1.5,
          padding: "8px 11px",
          borderRadius: 7,
          width: 230,
          zIndex: 300,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          pointerEvents: "none",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 400,
        }}>
          {text}
          {/* Flecha hacia abajo */}
          <span style={{
            position: "absolute", top: "100%", left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid #1e293b",
          }} />
        </div>
      )}
    </span>
  );
}
