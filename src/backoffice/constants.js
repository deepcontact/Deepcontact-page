// Day arrays — index 0 = Monday (matches JS getDay() + 6 % 7 convention used in SchedulesView)
export const DAYS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const DAYS_FULL  = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Campaign status display config — used by Badge.jsx
export const STATUS = {
  active:    { label: "Activa",      dot: "#10b981", bg: "#ecfdf5", text: "#059669" },
  scheduled: { label: "Programada",  dot: "#3b82f6", bg: "#eff6ff", text: "#1d4ed8" },
  paused:    { label: "Pausada",     dot: "#f59e0b", bg: "#fffbeb", text: "#d97706" },
  completed: { label: "Completada",  dot: "#8b5cf6", bg: "#f5f3ff", text: "#7c3aed" },
  draft:     { label: "Borrador",    dot: "#94a3b8", bg: "#f1f5f9", text: "#64748b" },
};
