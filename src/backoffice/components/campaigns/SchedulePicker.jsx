import Label from "../ui/Label";
import Tooltip, { InfoIcon } from "../ui/Tooltip";

// maxSpeed: límite de llamadas/min según los slots de los workspaces seleccionados
// startMode: "manual" | "scheduled" — si es manual, los campos se deshabilitan
export default function SchedulePicker({ value, onChange, maxSpeed = 20, startMode = "scheduled" }) {
  const isManual   = startMode === "manual";
  const clampedMax = Math.max(1, maxSpeed);

  const timeInvalid  = !isManual && value.startTime >= value.endTime;
  const noStartDate  = !isManual && !value.startDate;
  const dateInvalid  = !isManual && value.startDate && value.endDate && value.startDate > value.endDate;

  const handleSpeed = (raw) => {
    const v = Math.max(1, Math.min(clampedMax, +raw || 1));
    onChange({ ...value, callsPerMinute: v });
  };

  const fieldStyle = (invalid) => ({
    width: "100%", boxSizing: "border-box",
    background: isManual ? "#f8fafc" : "#fff",
    border: `1.5px solid ${!isManual && invalid ? "#ef4444" : "#d1d5db"}`,
    borderRadius: 7, padding: "9px 12px",
    color: isManual ? "#94a3b8" : "#111827",
    fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    outline: "none", cursor: isManual ? "not-allowed" : "auto",
  });

  return (
    <div>
      {/* Aviso modo manual */}
      {isManual && (
        <div style={{
          padding: "10px 13px", background: "#fffbeb",
          borderRadius: 7, border: "1px solid #fde68a", marginBottom: 16,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "#92400e", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
            <strong>Modo manual activo:</strong> La campaña se iniciará cuando vos lo decidas, por lo que la configuración de horario no aplica.
          </p>
        </div>
      )}

      {/* Fechas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
        <div>
          <Label>Fecha de inicio *</Label>
          <input
            type="date"
            value={value.startDate || ""}
            disabled={isManual}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
            style={fieldStyle(noStartDate || dateInvalid)}
          />
          {noStartDate && (
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#ef4444", fontFamily: "'DM Sans', sans-serif" }}>
              La fecha de inicio es requerida.
            </p>
          )}
        </div>
        <div>
          <Label>Fecha de fin <span style={{ fontWeight: 400, color: "#94a3b8" }}>(opcional)</span></Label>
          <input
            type="date"
            value={value.endDate || ""}
            min={value.startDate || ""}
            disabled={isManual}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
            style={fieldStyle(dateInvalid)}
          />
        </div>
      </div>
      {dateInvalid && (
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#ef4444", fontFamily: "'DM Sans', sans-serif" }}>
          La fecha de fin debe ser igual o posterior a la de inicio.
        </p>
      )}

      {/* Horas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12, marginBottom: 4 }}>
        <div>
          <Label>Hora de inicio</Label>
          <input
            type="time"
            value={value.startTime}
            disabled={isManual}
            onChange={(e) => onChange({ ...value, startTime: e.target.value })}
            style={fieldStyle(timeInvalid)}
          />
        </div>
        <div>
          <Label>Hora de fin</Label>
          <input
            type="time"
            value={value.endTime}
            disabled={isManual}
            onChange={(e) => onChange({ ...value, endTime: e.target.value })}
            style={fieldStyle(timeInvalid)}
          />
        </div>
      </div>
      {timeInvalid && (
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#ef4444", fontFamily: "'DM Sans', sans-serif" }}>
          La hora de inicio debe ser anterior a la hora de fin.
        </p>
      )}

      {/* Velocidad */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <Label style={{ margin: 0 }}>Llamadas por minuto (velocidad)</Label>
          <Tooltip text={`Velocidad máxima recomendada según los slots de los workspaces seleccionados: ${clampedMax} llamadas/min. Valores superiores pueden saturar el sistema.`}>
            <InfoIcon />
          </Tooltip>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="range" min={1} max={clampedMax}
            value={Math.min(value.callsPerMinute, clampedMax)}
            onChange={(e) => onChange({ ...value, callsPerMinute: +e.target.value })}
            style={{ flex: 1, accentColor: "#1e40af" }}
          />
          <input
            type="number" min={1} max={clampedMax}
            value={value.callsPerMinute}
            onChange={(e) => handleSpeed(e.target.value)}
            style={{
              width: 60, padding: "6px 8px", borderRadius: 7, textAlign: "center",
              border: "1.5px solid #d1d5db", fontSize: 14, fontWeight: 700,
              color: "#1e40af", fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
          />
        </div>
        <p style={{ margin: "5px 0 0", fontSize: 11, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
          Estimado: ~{value.callsPerMinute * 60} llamadas/hora
          <span style={{ color: "#94a3b8" }}> · máximo recomendado: {clampedMax}/min</span>
        </p>
      </div>
    </div>
  );
}
