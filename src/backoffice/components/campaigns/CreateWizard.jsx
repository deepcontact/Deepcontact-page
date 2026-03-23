import { useState, useRef, useEffect } from "react";
import { callEdge } from "../../api/supabase";
import Modal from "../ui/Modal";
import Btn from "../ui/Btn";
import Ico from "../ui/Ico";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Label from "../ui/Label";
import Tooltip, { InfoIcon } from "../ui/Tooltip";
import StepBar from "./StepBar";
import CSVTable from "./CSVTable";
import SchedulePicker from "./SchedulePicker";
import { parseCSV } from "../../utils/csv";

const today = () => new Date().toISOString().split("T")[0];

const DRAFT_KEY = "contactadora_campaign_draft";
const saveDraftToStorage = (data) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {} };
const loadDraftFromStorage = () => { try { const r = localStorage.getItem(DRAFT_KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const clearDraftFromStorage = () => { try { localStorage.removeItem(DRAFT_KEY); } catch {} };

const makeEmptyForm = () => ({
  name: "", agentId: "", startMode: "manual",
  schedule: { startDate: today(), endDate: "", startTime: "09:00", endTime: "18:00", callsPerMinute: 3 },
  retriesEnabled:       false,
  maxAttempts:          3,
  retryIntervalMinutes: 60,
});


function fmtInterval(min) {
  return `${min} min`;
}

export default function CreateWizard({ open, onClose, agents, onSave, onDraftSaved }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(makeEmptyForm);
  const [csvRows, setCsvRows] = useState([]);
  const [phoneCol, setPhoneCol] = useState("");
  const [nameCol, setNameCol] = useState("");
  const fileRef = useRef();

  // Workspace
  const [availableWorkspaces, setAvailableWorkspaces] = useState([]);
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState([]);
  const [noWsConfirmed, setNoWsConfirmed] = useState(false); // confirmación si no hay ws

  // Cancel confirm
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Double-click outside to save draft
  const outsideClickCountRef = useRef(0);
  const outsideClickTimerRef = useRef(null);

  // Steps dinámicos: se agrega "Reintentos" si está habilitado
  const STEPS = ["Información", "Números", "Contactos", "Horario", ...(form.retriesEnabled ? ["Reintentos"] : []), "Resumen"];
  const lastStep        = STEPS.length - 1;
  const currentStepName = STEPS[step];

  // Asegurar que el step sea válido si cambia la cantidad de pasos
  useEffect(() => {
    if (step >= STEPS.length) setStep(STEPS.length - 1);
  }, [form.retriesEnabled]);

  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  // Limpiar timer al desmontar
  useEffect(() => () => clearTimeout(outsideClickTimerRef.current), []);

  // Cargar workspaces y restaurar borrador al abrir
  useEffect(() => {
    if (open) {
      callEdge("manage-workspaces", { action: "list" })
        .then((d) => setAvailableWorkspaces(d.workspaces || []))
        .catch(() => setAvailableWorkspaces([]));
      const draft = loadDraftFromStorage();
      if (draft) {
        setForm(draft.form ?? makeEmptyForm());
        setStep(draft.step ?? 0);
        setCsvRows(draft.csvRows ?? []);
        setPhoneCol(draft.phoneCol ?? "");
        setNameCol(draft.nameCol ?? "");
        setSelectedWorkspaceIds(draft.selectedWorkspaceIds ?? []);
      }
    }
  }, [open]);

  const toggleWorkspace = (id) => {
    setSelectedWorkspaceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setNoWsConfirmed(false); // reset confirmación al cambiar selección
  };

  // Solo workspaces activos con número configurado
  const activeWs = availableWorkspaces.filter((w) => w.active && !w.is_pending);

  // Capacidad total según workspaces seleccionados
  const totalCapacity = selectedWorkspaceIds.reduce((s, id) => {
    const ws = availableWorkspaces.find((w) => w.id === id);
    return s + (ws?.max_concurrent || 20);
  }, 0);

  // Velocidad máxima = slots totales (mínimo 1, default 20 si no hay selección)
  const maxSpeed = totalCapacity > 0 ? totalCapacity : 20;

  // Clampar callsPerMinute si el maxSpeed baja (ej. al deseleccionar workspaces)
  useEffect(() => {
    if (form.schedule.callsPerMinute > maxSpeed) {
      setForm((f) => ({ ...f, schedule: { ...f.schedule, callsPerMinute: maxSpeed } }));
    }
  }, [maxSpeed]);

  const downloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const { dynamic_vars, agent_name } = await callEdge("retell-agents", {
        action:   "get",
        agent_id: form.agentId,
      });
      const headers = ["telefono", "nombre", ...(dynamic_vars || [])];
      const example = ["+5491112345678", "Juan García", ...(dynamic_vars || []).map((v) => `valor_${v}`)];
      const csvContent = [headers.join(","), example.join(",")].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `modelo_contactos_${(agent_name || form.agentId).replace(/\s+/g, "_")}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch {
      const blob = new Blob(["\uFEFF" + "telefono,nombre\n+5491112345678,Juan García"], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "modelo_contactos.csv"; a.click(); URL.revokeObjectURL(url);
    }
    setDownloadingTemplate(false);
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      setCsvRows(rows);
      if (rows.length) {
        const cols = Object.keys(rows[0]);
        setPhoneCol(cols.find((c) => /phone|tel|cel|mobile|numero/i.test(c)) || cols[0]);
        setNameCol(cols.find((c) => /name|nombre|cliente/i.test(c)) || cols[1] || cols[0]);
      }
    };
    reader.readAsText(file);
  };

  const contacts = csvRows
    .map((r) => ({ phone: r[phoneCol] || "", name: r[nameCol] || "Sin nombre", ...r }))
    .filter((c) => c.phone);
  const colOpts = csvRows.length ? Object.keys(csvRows[0]).map((k) => ({ value: k, label: k.replace(/_/g, " ") })) : [];

  // Validaciones step 3
  const isManual    = form.startMode === "manual";
  const timeInvalid = !isManual && form.schedule.startTime >= form.schedule.endTime;
  const dateInvalid = !isManual && form.schedule.startDate && form.schedule.endDate
    && form.schedule.startDate > form.schedule.endDate;
  const scheduleValid = isManual || (!!form.schedule.startDate && !timeInvalid && !dateInvalid);

  const canNext = {
    "Información": form.name.trim().length >= 3 && !!form.agentId,
    "Números":     selectedWorkspaceIds.length > 0 || activeWs.length === 0 || noWsConfirmed,
    "Contactos":   csvRows.length > 0 && !!phoneCol,
    "Horario":     scheduleValid,
    "Reintentos":  true,
    "Resumen":     true,
  }[currentStepName] ?? true;

  const doReset = () => {
    setStep(0); setCsvRows([]); setPhoneCol(""); setNameCol("");
    setSelectedWorkspaceIds([]); setNoWsConfirmed(false);
    setShowCancelConfirm(false);
    setForm(makeEmptyForm());
  };

  const handleCancel = () => setShowCancelConfirm(true);

  const confirmCancel = () => { clearDraftFromStorage(); doReset(); onClose(); };

  const handleOverlayClick = () => {
    outsideClickCountRef.current += 1;
    if (outsideClickCountRef.current === 1) {
      outsideClickTimerRef.current = setTimeout(() => {
        outsideClickCountRef.current = 0;
      }, 3000);
    } else if (outsideClickCountRef.current >= 2) {
      clearTimeout(outsideClickTimerRef.current);
      outsideClickCountRef.current = 0;
      saveDraftToStorage({ form, step, csvRows, phoneCol, nameCol, selectedWorkspaceIds });
      doReset();
      onClose();
      onDraftSaved?.();
    }
  };

  const handleSave = () => {
    onSave({
      ...form,
      contacts,
      workspaceIds:         selectedWorkspaceIds,
      maxAttempts:          form.retriesEnabled ? form.maxAttempts : 1,
      retryIntervalMinutes: form.retriesEnabled ? form.retryIntervalMinutes : 0,
    });
    clearDraftFromStorage(); doReset(); onClose();
  };

  // Resumen con emojis
  const summary = [
    ["📋 Nombre",      form.name],
    ["🤖 Agente",      agents.find((a) => a.agent_id === form.agentId)?.agent_name || "—"],
    ["📞 Workspaces",  selectedWorkspaceIds.length > 0
      ? `${selectedWorkspaceIds.length} seleccionados · ${totalCapacity} slots simultáneos`
      : "Ninguno (capacidad mínima)"],
    ["👥 Contactos",   `${contacts.length} de ${csvRows.length} filas válidas`],
    ["📅 Inicio",      isManual ? "— (modo manual)" : form.schedule.startDate || "—"],
    ["📅 Fin",         isManual ? "— (modo manual)" : form.schedule.endDate || "Sin fecha de fin"],
    ["⏰ Horario",     isManual ? "— (modo manual)" : `${form.schedule.startTime} — ${form.schedule.endTime}`],
    ["🚀 Velocidad",   `${form.schedule.callsPerMinute} llamadas / minuto`],
    ["▶️ Inicio",      form.startMode === "manual" ? "Manual" : "Automático (por horario)"],
    ["🔄 Reintentos",  form.retriesEnabled
      ? `${form.maxAttempts - 1} reintento${form.maxAttempts - 1 !== 1 ? "s" : ""} · cada ${fmtInterval(form.retryIntervalMinutes)}`
      : "Sin reintentos"],
  ];

  return (
    <Modal open={open} onClose={handleCancel} onOverlayClick={handleOverlayClick} title="Nueva Campaña" subtitle="Completá los pasos para configurar tu campaña de llamadas" width={600}>
      <StepBar steps={STEPS} current={step} />


      {/* ── Step 0 — Información ─────────────────────────────────── */}
      {currentStepName === "Información" && (
        <>
          <Input
            label="Nombre de la campaña *"
            placeholder="Ej: Campaña Ventas Q1 2025"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {form.name.trim().length > 0 && form.name.trim().length < 3 && (
            <p style={{ margin: "-10px 0 14px", fontSize: 11, color: "#ef4444", fontFamily: "'DM Sans', sans-serif" }}>
              El nombre debe tener al menos 3 caracteres.
            </p>
          )}

          <Select
            label="Agente *"
            options={[{ value: "", label: "Seleccionar agente..." }, ...agents.map((a) => ({ value: a.agent_id, label: a.agent_name }))]}
            value={form.agentId}
            onChange={(e) => setForm({ ...form, agentId: e.target.value })}
          />

          <div style={{ marginBottom: 4 }}>
            <Label>Modo de activación</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["manual",    "Manual",     "Iniciás la campaña cuando vos quieras"],
                ["scheduled", "Automático", "Se activa según el horario configurado"],
              ].map(([v, t, d]) => (
                <button key={v} onClick={() => setForm({ ...form, startMode: v })} style={{
                  padding: "12px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                  border: `1.5px solid ${form.startMode === v ? "#1e40af" : "#e2e8f0"}`,
                  background: form.startMode === v ? "#eff6ff" : "#fff",
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.startMode === v ? "#1e40af" : "#374151", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>{t}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{d}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Toggle reintentos ─────────────────────────────────── */}
          <div style={{ marginTop: 4 }}>
            <Label>Reintentos automáticos</Label>
            <button
              onClick={() => setForm((f) => ({ ...f, retriesEnabled: !f.retriesEnabled }))}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "12px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                border: `1.5px solid ${form.retriesEnabled ? "#059669" : "#e2e8f0"}`,
                background: form.retriesEnabled ? "#f0fdf4" : "#fff",
                transition: "all 0.15s",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.retriesEnabled ? "#059669" : "#374151", fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>
                  Ejecutar reintentos
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
                  {form.retriesEnabled ? "Activado · configurá los detalles en el paso siguiente" : "Si la llamada no es exitosa, no se reintentará"}
                </div>
              </div>
              {/* Toggle switch */}
              <div style={{
                width: 40, height: 22, borderRadius: 99, padding: 2, flexShrink: 0,
                background: form.retriesEnabled ? "#059669" : "#cbd5e1",
                transition: "background 0.2s", display: "flex", alignItems: "center",
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", background: "#fff",
                  transform: form.retriesEnabled ? "translateX(18px)" : "translateX(0)",
                  transition: "transform 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </div>
            </button>
          </div>
        </>
      )}

      {/* ── Step 1 — Números (workspaces) ────────────────────────── */}
      {currentStepName === "Números" && (
        <>
          {/* Título con tooltip de "workspace" */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <Label style={{ margin: 0 }}>Seleccioná los workspaces para esta campaña</Label>
            <Tooltip text="Cada workspace es un número telefónico con capacidad para realizar varias llamadas simultáneas. Los slots indican cuántas llamadas puede manejar a la vez.">
              <InfoIcon />
            </Tooltip>
          </div>
          <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
            Más workspaces = distribución por lotes y menor duración total de la campaña.
          </p>

          {activeWs.length === 0 ? (
            <div style={{ padding: "16px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#92400e", fontFamily: "'DM Sans', sans-serif" }}>
                No hay workspaces listos (con número de teléfono configurado). Configuralos en la sección <strong>Workspaces</strong> antes de crear la campaña, o continuá sin seleccionar ninguno para iniciarlo manualmente después.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {activeWs.map((ws) => {
                  const selected = selectedWorkspaceIds.includes(ws.id);
                  return (
                    <button key={ws.id} onClick={() => toggleWorkspace(ws.id)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left", width: "100%",
                      border: `1.5px solid ${selected ? "#1e40af" : "#e2e8f0"}`,
                      background: selected ? "#eff6ff" : "#fff",
                      transition: "all 0.15s",
                    }}>
                      {/* Checkbox visual */}
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `2px solid ${selected ? "#1e40af" : "#cbd5e1"}`,
                        background: selected ? "#1e40af" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, color: "#fff",
                      }}>
                        {selected && <Ico name="check" size={11} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: selected ? "#1e40af" : "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>{ws.nombre}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{ws.phone_number}</div>
                      </div>
                      {/* Slots con tooltip */}
                      <Tooltip text="Capacidad de llamadas simultáneas de este workspace. Más slots = más llamadas en paralelo sin espera.">
                        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#64748b", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                          {ws.max_concurrent} slots
                          <InfoIcon style={{ marginLeft: 2 }} />
                        </div>
                      </Tooltip>
                    </button>
                  );
                })}
              </div>

              {/* Advertencia si no se seleccionó ninguno */}
              {selectedWorkspaceIds.length === 0 && (
                <div style={{
                  padding: "12px 14px", background: "#fffbeb",
                  borderRadius: 8, border: "1px solid #fde68a", marginBottom: 10,
                }}>
                  <p style={{ margin: "0 0 10px", fontSize: 12, color: "#92400e", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                    ⚠️ No seleccionaste ningún workspace. La campaña usará la capacidad mínima disponible, lo que puede aumentar la duración total. ¿Deseás continuar?
                  </p>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: "#92400e", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={noWsConfirmed}
                      onChange={(e) => setNoWsConfirmed(e.target.checked)}
                      style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#d97706" }}
                    />
                    Sí, quiero continuar sin seleccionar workspaces
                  </label>
                </div>
              )}
            </>
          )}

          {/* Resumen de selección con tooltip de distribución por lotes */}
          <div style={{ padding: "10px 12px", background: "#eff6ff", borderRadius: 7, border: "1px solid #bfdbfe" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, color: "#1e40af", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                {selectedWorkspaceIds.length > 0
                  ? `${selectedWorkspaceIds.length} workspace${selectedWorkspaceIds.length !== 1 ? "s" : ""} seleccionado${selectedWorkspaceIds.length !== 1 ? "s" : ""} · ${totalCapacity} llamadas simultáneas`
                  : "Sin workspaces seleccionados (sin distribución por lotes)"}
              </span>
              <Tooltip text="Al seleccionar varios workspaces, los contactos se reparten automáticamente entre ellos (distribución por lotes) para minimizar la duración total de la campaña.">
                <InfoIcon />
              </Tooltip>
            </div>
          </div>
        </>
      )}

      {/* ── Step 2 — Contactos ───────────────────────────────────── */}
      {currentStepName === "Contactos" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button onClick={downloadTemplate} disabled={downloadingTemplate} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: downloadingTemplate ? "not-allowed" : "pointer",
              color: "#1e40af", fontSize: 12, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", opacity: downloadingTemplate ? 0.6 : 1,
              padding: "4px 0", textDecoration: "underline", textUnderlineOffset: 3,
            }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {downloadingTemplate ? "Generando..." : "Descargar modelo de ejemplo"}
            </button>
          </div>
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            style={{
              border: `2px dashed ${csvRows.length ? "#93c5fd" : "#cbd5e1"}`,
              borderRadius: 9, padding: "28px 20px", textAlign: "center", cursor: "pointer",
              background: csvRows.length ? "#eff6ff" : "#fafafa", transition: "all 0.2s", marginBottom: 14,
            }}
          >
            <div style={{ color: csvRows.length ? "#3b82f6" : "#94a3b8", marginBottom: 8, display: "flex", justifyContent: "center" }}>
              <Ico name={csvRows.length ? "check" : "upload"} size={26} />
            </div>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: csvRows.length ? "#1e40af" : "#374151", fontFamily: "'DM Sans', sans-serif" }}>
              {csvRows.length ? `${csvRows.length} filas cargadas correctamente` : "Arrastrá o hacé click para subir un CSV"}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>Archivos .csv o .txt con encabezados en la primera fila</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
          {csvRows.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Select label="Columna de teléfono *" options={colOpts} value={phoneCol} onChange={(e) => setPhoneCol(e.target.value)} />
                <Select label="Columna de nombre"     options={colOpts} value={nameCol}  onChange={(e) => setNameCol(e.target.value)} />
              </div>
              <div style={{ padding: "10px 12px", background: "#eff6ff", borderRadius: 7, border: "1px solid #bfdbfe", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#1e40af", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                  {contacts.length} contacto{contacts.length !== 1 ? "s" : ""} válido{contacts.length !== 1 ? "s" : ""} con número de teléfono
                </span>
              </div>
              <CSVTable rows={csvRows} />
            </>
          )}
        </>
      )}

      {/* ── Step 3 — Horario ─────────────────────────────────────── */}
      {currentStepName === "Horario" && (
        <SchedulePicker
          value={form.schedule}
          onChange={(s) => setForm({ ...form, schedule: s })}
          maxSpeed={maxSpeed}
          startMode={form.startMode}
        />
      )}

      {/* ── Step Reintentos (opcional) ───────────────────────────── */}
      {currentStepName === "Reintentos" && (
        <>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "#64748b", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
            Si el contacto no es atendido o la llamada es muy corta, el sistema reintentará automáticamente después del tiempo configurado.
          </p>

          {/* Cantidad de reintentos */}
          <div style={{ marginBottom: 20 }}>
            <Label>¿Cuántos reintentos?</Label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const val = n + 1; // maxAttempts = reintentos + intento inicial
                const active = form.maxAttempts === val;
                return (
                  <button key={n} onClick={() => setForm((f) => ({ ...f, maxAttempts: val }))} style={{
                    padding: "10px 18px", borderRadius: 8, cursor: "pointer",
                    border: `1.5px solid ${active ? "#1e40af" : "#e2e8f0"}`,
                    background: active ? "#eff6ff" : "#fff",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: active ? "#1e40af" : "#374151", fontFamily: "'DM Sans', sans-serif" }}>{n}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>{n === 1 ? "reintento" : "reintentos"}</div>
                  </button>
                );
              })}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
              El sistema intentará contactar a cada número hasta <strong>{form.maxAttempts} veces</strong> en total (1 inicial + {form.maxAttempts - 1} reintento{form.maxAttempts - 1 !== 1 ? "s" : ""}).
            </p>
          </div>

          {/* Intervalo entre reintentos */}
          <div>
            <Label>Tiempo entre reintentos (minutos)</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number"
                min={5}
                max={120}
                value={form.retryIntervalMinutes}
                onChange={(e) => {
                  const v = Math.min(120, Math.max(5, Number(e.target.value) || 5));
                  setForm((f) => ({ ...f, retryIntervalMinutes: v }));
                }}
                style={{
                  width: 90, padding: "9px 12px",
                  border: "1.5px solid #e2e8f0", borderRadius: 7,
                  fontSize: 18, fontWeight: 700, color: "#0f172a",
                  fontFamily: "'DM Sans', sans-serif", outline: "none",
                  background: "#f8fafc", textAlign: "center",
                }}
              />
              <span style={{ fontSize: 13, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>minutos</span>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
              Mínimo 5 min · Máximo 120 min. Después de terminar el lote, el sistema esperará <strong>{form.retryIntervalMinutes} minutos</strong> antes de reintentar.
            </p>
          </div>
        </>
      )}

      {/* ── Step Resumen ─────────────────────────────────────────── */}
      {currentStepName === "Resumen" && (
        <>
          <div style={{ background: "#f8fafc", borderRadius: 9, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 16 }}>
            {summary.map(([k, v], i) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "11px 16px",
                borderBottom: i < summary.length - 1 ? "1px solid #f1f5f9" : "none",
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>{k}</span>
                <span style={{ fontSize: 13, color: "#0f172a", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{
            padding: "12px 14px",
            background: form.startMode === "manual" ? "#f8fafc" : "#eff6ff",
            borderRadius: 8,
            border: `1px solid ${form.startMode === "manual" ? "#e2e8f0" : "#bfdbfe"}`,
          }}>
            <p style={{ margin: 0, fontSize: 12, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, color: form.startMode === "manual" ? "#64748b" : "#1e40af" }}>
              {form.startMode === "manual"
                ? "⏸ La campaña se creará en estado Pausada y deberás iniciarla manualmente desde el panel."
                : "✅ La campaña se creará en estado Programada y se activará automáticamente según el horario configurado."
              }
            </p>
          </div>
        </>
      )}

      {/* ── Footer nav ───────────────────────────────────────────── */}
      {showCancelConfirm ? (
        // Confirmación de cancelación
        <div style={{
          marginTop: 20, background: "#fef2f2", borderRadius: 8,
          padding: "16px", border: "1px solid #fecaca",
        }}>
          <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>
            ¿Estás seguro de que querés cancelar? Los cambios no guardados se perderán.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowCancelConfirm(false)}>
              No, continuar
            </Btn>
            <Btn variant="danger" onClick={confirmCancel} icon={<Ico name="x" size={13} />}>
              Sí, cancelar
            </Btn>
          </div>
        </div>
      ) : (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 24, paddingTop: 18, borderTop: "1px solid #f1f5f9",
        }}>
          {/* Izquierda: Cancelar + Anterior */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Btn variant="ghost" size="sm" onClick={handleCancel}>
              Cancelar
            </Btn>
            {step > 0 && (
              <Btn variant="ghost" onClick={() => setStep(step - 1)}>
                ← Anterior
              </Btn>
            )}
          </div>

          {/* Derecha: Continuar / Crear */}
          {step < lastStep
            ? <Btn variant="primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
                Continuar
              </Btn>
            : <Btn variant="primary" size="lg" onClick={handleSave} icon={<Ico name="check" size={14} />}>
                Crear campaña
              </Btn>
          }
        </div>
      )}
    </Modal>
  );
}
