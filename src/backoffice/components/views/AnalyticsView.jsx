import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { callEdge } from "../../api/supabase";
import Card from "../ui/Card";
import Btn from "../ui/Btn";
import Ico from "../ui/Ico";

const RESULT_COLORS = {
  successful:   "#10b981",
  unsuccessful: "#ef4444",
  unknown:      "#94a3b8",
};
const RESULT_LABELS = {
  successful:   "Exitosas",
  unsuccessful: "No exitosas",
  unknown:      "Sin datos",
};

const DISCONNECTION_LABELS = {
  user_hangup:                          "Usuario colgó",
  agent_hangup:                         "Agente colgó",
  dial_no_answer:                       "No contestó",
  voicemail:                            "Buzón de voz",
  busy_signal:                          "Línea ocupada",
  machine_detected:                     "Máquina detectada",
  telephony_provider_permission_denied: "Sin permiso",
  telephony_error:                      "Error telefónico",
  unknown:                              "Desconocido",
};

const SENTIMENT_CONFIG = {
  Positive: { label: "Positivo", color: "#059669", bg: "#ecfdf5" },
  Negative: { label: "Negativo", color: "#dc2626", bg: "#fef2f2" },
  Neutral:  { label: "Neutral",  color: "#64748b", bg: "#f8fafc" },
};

function fmtDuration(ms) {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmtDatetime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("es-AR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function exportCSV(calls, filters) {
  const hasSentiment = calls.some((c) => c.sentiment);
  const headers = ["Número", "Campaña", "Inicio", "Fin", "Duración (s)", "Estado", "Resultado", "Motivo desconexión", "Resumen", ...(hasSentiment ? ["Sentimiento"] : [])];
  const rows = calls.map((c) => [
    c.to_number ?? "",
    c.campaign_name ?? "",
    c.started_at ? new Date(c.started_at).toLocaleString("es-AR") : "",
    c.ended_at   ? new Date(c.ended_at).toLocaleString("es-AR")   : "",
    c.duration_ms ? Math.round(c.duration_ms / 1000) : "",
    c.status  ?? "",
    c.result  ?? "",
    c.disconnection_reason ?? "",
    (c.summary ?? "").replace(/"/g, '""'),
    ...(hasSentiment ? [c.sentiment ?? ""] : []),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v)}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `llamadas${filters.date_from ? "_" + filters.date_from : ""}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const today         = () => new Date().toISOString().split("T")[0];
const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

// Tooltip personalizado para los gráficos
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#0f172a" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color ?? "#374151" }}>
          {formatter ? formatter(p.value, p.name) : `${p.name}: ${p.value}`}
        </p>
      ))}
    </div>
  );
}

const inputStyle = {
  padding: "6px 10px", border: "1.5px solid #e2e8f0", borderRadius: 7,
  fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#f8fafc",
};

export default function AnalyticsView({ campaigns, activeTab = "dashboard" }) {
  const [filters, setFilters] = useState({
    date_from:   thirtyDaysAgo(),
    date_to:     today(),
    campaign_id: "",
    result:      "",
  });
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 50;

  const load = async (f = filters, p = page) => {
    setLoading(true);
    try {
      const res = await callEdge("get-analytics", {
        date_from:   f.date_from   || undefined,
        date_to:     f.date_to     || undefined,
        campaign_id: f.campaign_id || undefined,
        result:      f.result      || undefined,
        page:        p,
        page_size:   PAGE_SIZE,
      });
      setData(res);
    } catch (e) {
      console.error("Error cargando analíticas:", e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const applyFilters = () => { setPage(1); load(filters, 1); };

  const kpis          = data?.kpis           ?? {};
  const calls         = data?.calls          ?? [];
  const byDay         = data?.by_day         ?? [];
  const byResult      = data?.by_result      ?? [];
  const byHour        = data?.by_hour        ?? [];
  const byCampaign    = data?.by_campaign    ?? [];
  const byDisconn     = data?.by_disconnection ?? [];
  const byWeekday     = data?.by_weekday     ?? [];
  const total         = data?.total          ?? 0;
  const totalPages    = Math.ceil(total / PAGE_SIZE);
  const hasSentiment  = calls.some((c) => c.sentiment);

  const fmtDayTick = (d) => d ? d.substring(5).replace("-", "/") : "";

  const CHART_CARD = { padding: "18px 20px" };
  const CHART_TITLE = { margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0f172a" };
  const NO_DATA = (
    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: 13 }}>
      Sin datos para el período
    </div>
  );

  return (
    <div>

      {/* ── Filtros ────────────────────────────────────────────────────── */}
      <Card style={{ padding: "14px 18px", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Desde</label>
            <input type="date" value={filters.date_from}
              onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
              style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Hasta</label>
            <input type="date" value={filters.date_to}
              onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
              style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Campaña</label>
            <select value={filters.campaign_id}
              onChange={(e) => setFilters((f) => ({ ...f, campaign_id: e.target.value }))}
              style={{ ...inputStyle, minWidth: 150 }}>
              <option value="">Todas</option>
              {(campaigns ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Resultado</label>
            <select value={filters.result}
              onChange={(e) => setFilters((f) => ({ ...f, result: e.target.value }))}
              style={{ ...inputStyle, minWidth: 130 }}>
              <option value="">Todos</option>
              <option value="successful">Exitosas</option>
              <option value="unsuccessful">No exitosas</option>
              <option value="unknown">Sin datos</option>
            </select>
          </div>
          <Btn variant="primary" size="sm" onClick={applyFilters} icon={<Ico name="refresh" size={12} />}>
            Aplicar
          </Btn>
          <div style={{ marginLeft: "auto" }}>
            <Btn variant="secondary" size="sm" onClick={() => exportCSV(calls, filters)}
              icon={<Ico name="upload" size={12} />} disabled={calls.length === 0}>
              Exportar CSV
            </Btn>
          </div>
        </div>
      </Card>

      {activeTab === "dashboard" && <>
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 22 }}>
        {[
          { label: "Total llamadas",     value: loading ? "…" : (kpis.total_calls ?? 0),                                     color: "#1e40af", bg: "#eff6ff", icon: "phone" },
          { label: "Contestadas",        value: loading ? "…" : `${kpis.answered ?? 0} (${kpis.answer_rate ?? 0}%)`,         color: "#059669", bg: "#ecfdf5", icon: "check" },
          { label: "Exitosas",           value: loading ? "…" : `${kpis.successful ?? 0} (${kpis.success_rate ?? 0}%)`,      color: "#7c3aed", bg: "#f5f3ff", icon: "check" },
          { label: "Sin contestar",      value: loading ? "…" : `${kpis.no_answer ?? 0} (${kpis.no_answer_rate ?? 0}%)`,    color: "#ef4444", bg: "#fef2f2", icon: "x" },
          { label: "Buzón de voz",       value: loading ? "…" : `${kpis.voicemail ?? 0} (${kpis.voicemail_rate ?? 0}%)`,    color: "#f59e0b", bg: "#fffbeb", icon: "clock" },
          { label: "Duración promedio",  value: loading ? "…" : fmtDuration((kpis.avg_duration_seconds ?? 0) * 1000),        color: "#0891b2", bg: "#ecfeff", icon: "clock" },
        ].map((k) => (
          <Card key={k.label} style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: k.color, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{k.value}</p>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", color: k.color, flexShrink: 0 }}>
                <Ico name={k.icon} size={15} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Fila 1: Líneas por día | Resultados ────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>

        <Card style={CHART_CARD}>
          <p style={CHART_TITLE}>Llamadas por día</p>
          {byDay.length === 0 ? NO_DATA : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={byDay} margin={{ top: 0, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={fmtDayTick} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", borderRadius: 7, border: "1px solid #e2e8f0" }}
                  formatter={(v, n) => [v, n === "total" ? "Total" : "Exitosas"]}
                  labelFormatter={(l) => `Día: ${l}`}
                />
                <Line type="monotone" dataKey="total"      stroke="#3b82f6" strokeWidth={2} dot={false} name="total" />
                <Line type="monotone" dataKey="successful" stroke="#10b981" strokeWidth={2} dot={false} name="successful" />
              </LineChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            {[{ color: "#3b82f6", label: "Total" }, { color: "#10b981", label: "Exitosas" }].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 14, height: 2, background: l.color, borderRadius: 1 }} />
                <span style={{ fontSize: 11, color: "#64748b" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={CHART_CARD}>
          <p style={CHART_TITLE}>Resultados</p>
          {byResult.length === 0 ? NO_DATA : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byResult} margin={{ top: 0, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="result" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(r) => RESULT_LABELS[r] ?? r} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", borderRadius: 7, border: "1px solid #e2e8f0" }}
                  formatter={(v, _n, { payload }) => [v, RESULT_LABELS[payload?.result] ?? payload?.result]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {byResult.map((entry, i) => (
                    <Cell key={i} fill={RESULT_COLORS[entry.result] ?? "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── Fila 2: Por hora | Por campaña ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

        <Card style={CHART_CARD}>
          <p style={CHART_TITLE}>Llamadas por hora del día</p>
          {byHour.every((h) => h.count === 0) ? NO_DATA : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byHour} margin={{ top: 0, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", borderRadius: 7, border: "1px solid #e2e8f0" }}
                  formatter={(v) => [v, "Llamadas"]}
                  labelFormatter={(l) => `Hora: ${l}`}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]}>
                  {byHour.map((entry, i) => (
                    <Cell key={i} fill={entry.count === Math.max(...byHour.map((h) => h.count)) ? "#1e40af" : "#93c5fd"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p style={{ margin: "8px 0 0", fontSize: 10, color: "#94a3b8" }}>La barra más oscura indica el pico horario</p>
        </Card>

        <Card style={CHART_CARD}>
          <p style={CHART_TITLE}>Tasa de éxito por campaña</p>
          {byCampaign.length === 0 ? NO_DATA : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={byCampaign}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={90}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(v) => v.length > 12 ? v.substring(0, 12) + "…" : v} />
                <Tooltip
                  contentStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", borderRadius: 7, border: "1px solid #e2e8f0" }}
                  formatter={(v, _n, { payload }) => [`${v}% (${payload.successful}/${payload.total})`, "Éxito"]}
                />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                  {byCampaign.map((entry, i) => (
                    <Cell key={i} fill={entry.rate >= 60 ? "#10b981" : entry.rate >= 30 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── Fila 3: Motivos | Por día semana ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>

        <Card style={CHART_CARD}>
          <p style={CHART_TITLE}>Motivos de desconexión</p>
          {byDisconn.length === 0 ? NO_DATA : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={byDisconn}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <YAxis type="category" dataKey="reason" width={100}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(v) => {
                    const label = DISCONNECTION_LABELS[v] ?? v;
                    return label.length > 14 ? label.substring(0, 14) + "…" : label;
                  }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", borderRadius: 7, border: "1px solid #e2e8f0" }}
                  formatter={(v, _n, { payload }) => [v, DISCONNECTION_LABELS[payload.reason] ?? payload.reason]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {byDisconn.map((entry, i) => (
                    <Cell key={i}
                      fill={["user_hangup", "agent_hangup"].includes(entry.reason) ? "#10b981"
                        : entry.reason === "dial_no_answer" ? "#ef4444"
                        : entry.reason === "voicemail" ? "#f59e0b"
                        : "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card style={CHART_CARD}>
          <p style={CHART_TITLE}>Tasa de éxito por día de la semana</p>
          {byWeekday.every((d) => d.total === 0) ? NO_DATA : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byWeekday} margin={{ top: 0, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", borderRadius: 7, border: "1px solid #e2e8f0" }}
                  formatter={(v, _n, { payload }) => [`${v}% (${payload.successful}/${payload.total})`, "Éxito"]}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {byWeekday.map((entry, i) => (
                    <Cell key={i} fill={entry.rate >= 60 ? "#10b981" : entry.rate >= 30 ? "#f59e0b" : entry.total === 0 ? "#e2e8f0" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      </>}

      {activeTab === "logs" && <>
      {/* ── Tabla de llamadas ───────────────────────────────────────────── */}
      <Card style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Número", "Campaña", "Inicio", "Duración", "Resultado", "Motivo", ...(hasSentiment ? ["Sentimiento"] : []), "Resumen"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
                    color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={hasSentiment ? 8 : 7} style={{ padding: "48px", textAlign: "center" }}>
                    <span style={{ width: 24, height: 24, border: "3px solid #e2e8f0", borderTopColor: "#1e40af", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                  </td>
                </tr>
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={hasSentiment ? 8 : 7} style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    Sin llamadas en el período seleccionado
                  </td>
                </tr>
              ) : calls.map((c) => {
                const sentCfg = SENTIMENT_CONFIG[c.sentiment];
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#fafbfc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                  >
                    <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#0f172a", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                      {c.to_number}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#374151" }}>{c.campaign_name}</td>
                    <td style={{ padding: "10px 14px", fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>{fmtDatetime(c.started_at)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#374151" }}>{fmtDuration(c.duration_ms)}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: c.result === "successful" ? "#ecfdf5" : c.result === "unsuccessful" ? "#fef2f2" : "#f8fafc",
                        color:      c.result === "successful" ? "#059669" : c.result === "unsuccessful" ? "#dc2626" : "#94a3b8",
                      }}>
                        {RESULT_LABELS[c.result] ?? c.result ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 11, color: "#64748b" }}>
                      {DISCONNECTION_LABELS[c.disconnection_reason] ?? c.disconnection_reason ?? "—"}
                    </td>
                    {hasSentiment && (
                      <td style={{ padding: "10px 14px" }}>
                        {sentCfg ? (
                          <span style={{
                            display: "inline-flex", alignItems: "center",
                            padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                            background: sentCfg.bg, color: sentCfg.color,
                          }}>
                            {sentCfg.label}
                          </span>
                        ) : (
                          <span style={{ color: "#cbd5e1", fontSize: 11 }}>—</span>
                        )}
                      </td>
                    )}
                    <td style={{ padding: "10px 14px", fontSize: 11, color: "#64748b", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.summary ?? ""}>
                      {c.summary ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ padding: "10px 14px", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              {total} llamadas · página {page} de {totalPages}
            </span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {/* Anterior */}
              <button
                onClick={() => { const p = page - 1; setPage(p); load(filters, p); }}
                disabled={page <= 1}
                style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                  background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer",
                  fontSize: 12, color: page <= 1 ? "#cbd5e1" : "#64748b",
                  fontFamily: "'DM Sans', sans-serif",
                }}>←</button>

              {/* Tabs numerados (máximo 7 visibles con elipsis) */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} style={{ padding: "5px 4px", fontSize: 12, color: "#94a3b8" }}>…</span>
                  ) : (
                    <button key={p}
                      onClick={() => { setPage(p); load(filters, p); }}
                      style={{
                        padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                        background: p === page ? "#0f172a" : "#fff",
                        color: p === page ? "#f8fafc" : "#64748b",
                        cursor: "pointer", fontSize: 12, fontWeight: p === page ? 700 : 400,
                        fontFamily: "'DM Sans', sans-serif", minWidth: 32,
                      }}>{p}</button>
                  )
                )}

              {/* Siguiente */}
              <button
                onClick={() => { const p = page + 1; setPage(p); load(filters, p); }}
                disabled={page >= totalPages}
                style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                  background: "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer",
                  fontSize: 12, color: page >= totalPages ? "#cbd5e1" : "#64748b",
                  fontFamily: "'DM Sans', sans-serif",
                }}>→</button>
            </div>
          </div>
        )}

        <div style={{ padding: "8px 14px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8" }}>
          {total} llamada{total !== 1 ? "s" : ""} en total
        </div>
      </Card>
      </>}

    </div>
  );
}
