import { useState } from "react";
import Card from "../ui/Card";
import Ico from "../ui/Ico";
import Badge from "../ui/Badge";
import { DAYS_SHORT, DAYS_FULL } from "../../constants";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 to 21:00
const CAMPAIGN_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#f97316"];

export default function SchedulesView({ campaigns, agents }) {
  const [hoveredBlock, setHoveredBlock] = useState(null);

  const now = new Date();
  const currentDay = (now.getDay() + 6) % 7; // Monday = 0
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Only campaigns with schedules
  const scheduled = campaigns.filter((c) => c.schedule && c.schedule.days?.length > 0);

  // Parse time string "HH:MM" to hours as float
  const parseTime = (t) => {
    const [h, m] = (t || "09:00").split(":").map(Number);
    return h + m / 60;
  };

  // Active campaigns right now
  const activeCampaigns = scheduled.filter((c) => {
    if (c.status !== "active" && c.status !== "scheduled") return false;
    if (!c.schedule.days.includes(currentDay)) return false;
    const start = parseTime(c.schedule.startTime);
    const end = parseTime(c.schedule.endTime);
    const nowFloat = currentHour + currentMinute / 60;
    return nowFloat >= start && nowFloat < end;
  });

  // Total weekly hours
  const totalWeeklyHours = scheduled.reduce((sum, c) => {
    const start = parseTime(c.schedule.startTime);
    const end = parseTime(c.schedule.endTime);
    const hoursPerDay = Math.max(0, end - start);
    return sum + hoursPerDay * c.schedule.days.length;
  }, 0);

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Campañas programadas", value: scheduled.length, color: "#3b82f6" },
          { label: "Activas ahora", value: activeCampaigns.length, color: "#10b981" },
          { label: "Horas/semana", value: Math.round(totalWeeklyHours), color: "#7c3aed" },
          { label: "Llamadas/hora (pico)", value: scheduled.reduce((max, c) => Math.max(max, (c.schedule?.callsPerMinute || 0) * 60), 0).toLocaleString(), color: "#d97706" },
        ].map((k) => (
          <Card key={k.label} style={{ padding: "16px 18px" }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k.label}</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: k.color, letterSpacing: "-0.03em" }}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Now indicator */}
      {activeCampaigns.length > 0 && (
        <Card style={{ padding: "14px 18px", marginBottom: 18, border: "1px solid #a7f3d0", background: "#ecfdf5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.2)", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#059669", fontFamily: "'DM Sans', sans-serif" }}>
              En horario activo — {activeCampaigns.map((c) => c.name).join(", ")}
            </span>
          </div>
        </Card>
      )}

      {/* Weekly calendar */}
      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 22 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Ico name="clock" size={15} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>Vista semanal</span>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {scheduled.map((c, i) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length] }} />
                <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 800 }}>
            {/* Header row: days */}
            <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ padding: "8px 10px", background: "#f8fafc" }} />
              {DAYS_SHORT.map((d, i) => (
                <div key={d} style={{
                  padding: "8px 10px", textAlign: "center", background: "#f8fafc",
                  borderLeft: "1px solid #f1f5f9",
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                    color: i === currentDay ? "#1e40af" : "#64748b",
                    fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                  }}>{d}</div>
                  {i === currentDay && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1e40af", margin: "3px auto 0" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Time rows */}
            {HOURS.map((hour) => (
              <div key={hour} style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", borderBottom: "1px solid #f1f5f9", minHeight: 44 }}>
                {/* Hour label */}
                <div style={{
                  padding: "4px 10px", fontSize: 10, fontWeight: 600, color: "#94a3b8",
                  fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "flex-start",
                  justifyContent: "flex-end", paddingTop: 6, background: "#fafbfc",
                }}>
                  {String(hour).padStart(2, "0")}:00
                </div>

                {/* Day cells */}
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  // Find campaigns active in this cell
                  const cellCampaigns = scheduled.filter((c) => {
                    if (!c.schedule.days.includes(dayIdx)) return false;
                    const start = parseTime(c.schedule.startTime);
                    const end = parseTime(c.schedule.endTime);
                    return hour >= Math.floor(start) && hour < Math.ceil(end);
                  });

                  const isNow = dayIdx === currentDay && hour === currentHour;

                  return (
                    <div key={dayIdx} style={{
                      borderLeft: "1px solid #f1f5f9",
                      padding: 2,
                      background: isNow ? "#eff6ff" : "transparent",
                      position: "relative",
                    }}>
                      {isNow && (
                        <div style={{
                          position: "absolute", left: 0, right: 0,
                          top: `${(currentMinute / 60) * 100}%`,
                          height: 2, background: "#3b82f6", zIndex: 5,
                        }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", position: "absolute", left: -3, top: -2 }} />
                        </div>
                      )}
                      {cellCampaigns.map((c, ci) => {
                        const idx = scheduled.indexOf(c);
                        const color = CAMPAIGN_COLORS[idx % CAMPAIGN_COLORS.length];
                        const isHovered = hoveredBlock === `${c.id}-${dayIdx}-${hour}`;
                        return (
                          <div
                            key={c.id}
                            onMouseEnter={() => setHoveredBlock(`${c.id}-${dayIdx}-${hour}`)}
                            onMouseLeave={() => setHoveredBlock(null)}
                            style={{
                              background: color + "18",
                              borderLeft: `3px solid ${color}`,
                              borderRadius: 4,
                              padding: "3px 6px",
                              marginBottom: 1,
                              cursor: "default",
                              transition: "all 0.1s",
                              transform: isHovered ? "scale(1.02)" : "none",
                              position: "relative",
                              zIndex: isHovered ? 10 : 1,
                            }}
                          >
                            <div style={{ fontSize: 9, fontWeight: 600, color, lineHeight: 1.3, fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.name.length > 15 ? c.name.slice(0, 15) + "…" : c.name}
                            </div>
                            {isHovered && (
                              <div style={{
                                position: "absolute", top: "100%", left: 0, marginTop: 4,
                                background: "#0f172a", color: "#fff", padding: "8px 10px",
                                borderRadius: 7, fontSize: 11, lineHeight: 1.5, width: 180,
                                zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                                fontFamily: "'DM Sans', sans-serif",
                              }}>
                                <div style={{ fontWeight: 700, marginBottom: 2 }}>{c.name}</div>
                                <div>{c.schedule.startTime}–{c.schedule.endTime}</div>
                                <div>{c.schedule.callsPerMinute} llamadas/min</div>
                                <div style={{ opacity: 0.7 }}>{agents.find((a) => a.agent_id === c.agentId)?.agent_name || "—"}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Schedule list */}
      <Card style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>Detalle de horarios</span>
        </div>
        {scheduled.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{ color: "#cbd5e1", display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <Ico name="clock" size={36} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>No hay horarios configurados</p>
            <p style={{ fontSize: 12, color: "#cbd5e1" }}>Creá una campaña con horario para verla acá</p>
          </div>
        ) : (
          <div>
            {scheduled.map((c, i) => {
              const agent = agents.find((a) => a.agent_id === c.agentId);
              const color = CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length];
              const days = c.schedule.days.map((d) => DAYS_FULL[d]).join(", ");
              return (
                <div key={c.id} style={{
                  padding: "14px 18px", borderBottom: "1px solid #f1f5f9",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ width: 4, height: 40, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>{c.name}</span>
                      <Badge status={c.status} />
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Ico name="clock" size={11} />
                        {c.schedule.startTime}–{c.schedule.endTime}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Ico name="agent" size={11} />
                        {agent?.agent_name?.split("—")[0]?.trim() || "—"}
                      </span>
                      <span>{c.schedule.callsPerMinute} llamadas/min</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{days}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono', monospace", textAlign: "right", flexShrink: 0 }}>
                    ~{c.schedule.callsPerMinute * 60}/hr
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
