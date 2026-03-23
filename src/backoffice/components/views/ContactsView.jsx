import { useState, useRef } from "react";
import Card from "../ui/Card";
import Btn from "../ui/Btn";
import Ico from "../ui/Ico";
import { parseCSV } from "../../utils/csv";

export default function ContactsView({ campaigns, agents, onImportRef }) {
  const [search, setSearch] = useState("");
  const [filterCampaign, setFilterCampaign] = useState("all");
  const [importedContacts, setImportedContacts] = useState([]);
  const fileRef = useRef();

  // Expose import trigger to parent
  if (onImportRef) onImportRef.current = () => fileRef.current?.click();

  // Build contacts list from campaigns + imported
  const allContacts = [];

  campaigns.forEach((c) => {
    const agent = agents.find((a) => a.agent_id === c.agentId);
    c.contacts.forEach((contact, i) => {
      allContacts.push({
        id: `${c.id}-${i}`,
        name: contact.name || contact.nombre || `Contacto ${i + 1}`,
        phone: contact.phone || contact.telefono || contact.tel || "—",
        campaignId: c.id,
        campaignName: c.name,
        agentName: agent?.agent_name || "—",
        called: i < c.called,
      });
    });
  });

  importedContacts.forEach((contact, i) => {
    allContacts.push({
      id: `imp-${i}`,
      name: contact.name || contact.nombre || "Sin nombre",
      phone: contact.phone || contact.telefono || contact.tel || "—",
      campaignId: null,
      campaignName: "Sin asignar",
      agentName: "—",
      called: false,
    });
  });

  const filtered = allContacts
    .filter((c) => filterCampaign === "all" || c.campaignId === filterCampaign || (filterCampaign === "unassigned" && !c.campaignId))
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    );

  const totalCalled = allContacts.filter((c) => c.called).length;
  const totalPending = allContacts.filter((c) => !c.called).length;

  const handleImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      setImportedContacts((prev) => [...prev, ...rows]);
    };
    reader.readAsText(file);
  };

  // Paginate to avoid rendering thousands of rows
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(0);
  const pageStart = page * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageEnd);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total contactos", value: allContacts.length.toLocaleString(), color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Llamados", value: totalCalled.toLocaleString(), color: "#059669", bg: "#ecfdf5" },
          { label: "Pendientes", value: totalPending.toLocaleString(), color: "#d97706", bg: "#fffbeb" },
          { label: "Importados", value: importedContacts.length.toLocaleString(), color: "#3b82f6", bg: "#eff6ff" },
        ].map((k) => (
          <Card key={k.label} style={{ padding: "16px 18px" }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k.label}</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: k.color, letterSpacing: "-0.03em" }}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}>
              <Ico name="users" size={14} />
            </div>
            <input
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              style={{
                width: "100%", padding: "8px 12px 8px 32px", border: "1.5px solid #e2e8f0",
                borderRadius: 7, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                outline: "none", background: "#f8fafc", color: "#0f172a",
              }}
            />
          </div>
          <select
            value={filterCampaign}
            onChange={(e) => { setFilterCampaign(e.target.value); setPage(0); }}
            style={{
              padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 7,
              fontSize: 12, fontFamily: "'DM Sans', sans-serif", background: "#f8fafc",
              color: "#374151", cursor: "pointer", outline: "none",
            }}
          >
            <option value="all">Todas las campañas</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            {importedContacts.length > 0 && <option value="unassigned">Sin asignar</option>}
          </select>
        </div>
      </Card>

      <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={(e) => handleImport(e.target.files[0])} />

      {/* Table */}
      {filtered.length === 0 ? (
        <Card style={{ padding: "52px 20px", textAlign: "center" }}>
          <div style={{ color: "#cbd5e1", display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Ico name="users" size={40} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
            {search ? "Sin resultados" : "No hay contactos"}
          </p>
          <p style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 20 }}>
            {search ? "Probá con otro término" : "Importá un CSV o creá una campaña con contactos"}
          </p>
          {!search && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Btn variant="primary" icon={<Ico name="upload" size={14} />} onClick={() => fileRef.current?.click()}>Importar CSV</Btn>
            </div>
          )}
        </Card>
      ) : (
        <Card style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Nombre", "Teléfono", "Campaña", "Agente", "Estado"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700,
                      color: "#64748b", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: c.called ? "#ecfdf5" : "#f1f5f9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: c.called ? "#059669" : "#94a3b8", flexShrink: 0,
                          fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "#374151", fontFamily: "'DM Mono', monospace" }}>{c.phone}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: c.campaignId ? "#1e40af" : "#94a3b8",
                        background: c.campaignId ? "#eff6ff" : "#f8fafc",
                        padding: "3px 8px", borderRadius: 99, fontFamily: "'DM Sans', sans-serif",
                      }}>{c.campaignName}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>{c.agentName?.split("—")[0]?.trim()}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        background: c.called ? "#ecfdf5" : "#f8fafc",
                        color: c.called ? "#059669" : "#94a3b8",
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%", display: "inline-block",
                          background: c.called ? "#10b981" : "#cbd5e1",
                        }} />
                        {c.called ? "Llamado" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Footer with pagination */}
          <div style={{
            padding: "10px 16px", background: "#f8fafc", borderTop: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontSize: 11, color: "#94a3b8", fontFamily: "'DM Sans', sans-serif",
          }}>
            <span>{filtered.length.toLocaleString()} contacto{filtered.length !== 1 ? "s" : ""}</span>
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  style={{
                    padding: "4px 10px", borderRadius: 5, border: "1px solid #e2e8f0",
                    background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer",
                    opacity: page === 0 ? 0.4 : 1, fontSize: 11, fontWeight: 600, color: "#374151",
                  }}
                >Anterior</button>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  style={{
                    padding: "4px 10px", borderRadius: 5, border: "1px solid #e2e8f0",
                    background: "#fff", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                    opacity: page >= totalPages - 1 ? 0.4 : 1, fontSize: 11, fontWeight: 600, color: "#374151",
                  }}
                >Siguiente</button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
