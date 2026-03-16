import { useState, useMemo } from "react";

const ASSET_TYPES = ["Laptop", "Desktop", "Mobile Device", "Server", "Monitor", "Keyboard/Mouse", "Peripheral", "Other"];
const TYPE_ICONS = { "Laptop": "💻", "Desktop": "🖥️", "Mobile Device": "📱", "Server": "🗄️", "Monitor": "🖥", "Keyboard/Mouse": "⌨️", "Peripheral": "🔌", "Other": "📦" };
const STATUSES = ["Active", "Under Repair", "Retired", "In Storage", "Disposed"];

const STATUS_META = {
  "Active":       { bg: "#052e16", border: "#166534", text: "#4ade80", dot: "#22c55e" },
  "Under Repair": { bg: "#2d1b00", border: "#92400e", text: "#fbbf24", dot: "#f59e0b" },
  "Retired":      { bg: "#1c1c1c", border: "#374151", text: "#9ca3af", dot: "#6b7280" },
  "In Storage":   { bg: "#0c1a2e", border: "#1e3a5f", text: "#60a5fa", dot: "#3b82f6" },
  "Disposed":     { bg: "#2d0707", border: "#991b1b", text: "#fca5a5", dot: "#f87171" },
};

const SAMPLE = [
  { id: "AST-0001", product: "Dell XPS 15", manufacturer: "Dell", name: "Laptop - Ravi", assetTag: "KFJ-TAG-001", serial: "DXP-98761", acquisition: "2023-01-15", warranty: "2026-01-15", location: "Bangalore HQ", status: "Active", assignedTo: "Ravi Kumar", department: "IT", type: "Laptop", invoice: "INV-2023-001" },
  { id: "AST-0002", product: "MacBook Air M2", manufacturer: "Apple", name: "Laptop - Meena", assetTag: "KFJ-TAG-002", serial: "MBA-M2-4421", acquisition: "2023-09-01", warranty: "2025-09-01", location: "Hyderabad", status: "Active", assignedTo: "Meena Sharma", department: "Finance", type: "Laptop", invoice: "INV-2023-002" },
  { id: "AST-0003", product: "iPhone 14 Pro", manufacturer: "Apple", name: "Mobile - Arjun", assetTag: "KFJ-TAG-003", serial: "IPH-14P-009", acquisition: "2023-06-10", warranty: "2025-06-10", location: "Chennai", status: "Active", assignedTo: "Arjun Nair", department: "Sales", type: "Mobile Device", invoice: "INV-2023-003" },
  { id: "AST-0004", product: "HP ProLiant G10", manufacturer: "HP", name: "Server - IT", assetTag: "KFJ-TAG-004", serial: "HPPL-0023", acquisition: "2021-09-10", warranty: "2024-09-10", location: "Bangalore HQ", status: "Under Repair", assignedTo: "IT Team", department: "IT", type: "Server", invoice: "INV-2021-004" },
  { id: "AST-0005", product: 'Dell UltraSharp 27"', manufacturer: "Dell", name: "Monitor - Store", assetTag: "KFJ-TAG-005", serial: "DUS27-7890", acquisition: "2022-11-05", warranty: "2025-11-05", location: "Mumbai WH", status: "In Storage", assignedTo: "", department: "", type: "Monitor", invoice: "INV-2022-005" },
  { id: "AST-0006", product: "Logitech MX Keys", manufacturer: "Logitech", name: "Keyboard - Priya", assetTag: "KFJ-TAG-006", serial: "LGT-MX-221", acquisition: "2023-03-20", warranty: "2025-03-20", location: "Bangalore HQ", status: "Active", assignedTo: "Priya Rao", department: "HR", type: "Keyboard/Mouse", invoice: "INV-2023-006" },
];

const BLANK = { product: "", manufacturer: "", name: "", assetTag: "", serial: "", acquisition: "", warranty: "", location: "", status: "Active", assignedTo: "", department: "", type: "Laptop", invoice: "" };
let _counter = 7;
const genId = () => `AST-${String(_counter++).padStart(4, "0")}`;

const TABLE_COLS = [
  { key: "id",           label: "ID" },
  { key: "product",      label: "Product" },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "name",         label: "Asset Name" },
  { key: "assetTag",     label: "Asset Tag" },
  { key: "serial",       label: "Serial Number" },
  { key: "type",         label: "Asset Type" },
  { key: "status",       label: "Asset State" },
  { key: "assignedTo",   label: "Assigned To" },
  { key: "department",   label: "Department" },
  { key: "location",     label: "Location" },
  { key: "acquisition",  label: "Acquisition Date" },
  { key: "warranty",     label: "Warranty Expiry" },
  { key: "invoice",      label: "Invoice Number" },
];

export default function App() {
  const [assets, setAssets]       = useState(SAMPLE);
  const [search, setSearch]       = useState("");
  const [fType, setFType]         = useState("All");
  const [fStatus, setFStatus]     = useState("All");
  const [sort, setSort]           = useState({ col: "id", dir: "asc" });
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(BLANK);
  const [err, setErr]             = useState("");
  const [delTarget, setDelTarget] = useState(null);
  const [toast, setToast]         = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [csvPreview, setCsvPreview]   = useState([]);
  const [csvRaw, setCsvRaw]           = useState("");

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2600); };
  const openAdd   = () => { setForm(BLANK); setErr(""); setModal({ mode: "add" }); };
  const openEdit  = a  => { setForm({ ...a }); setErr(""); setModal({ mode: "edit", asset: a }); };
  const closeModal = () => setModal(null);
  const doSort = col => setSort(s => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...assets]
      .filter(a => !q || [a.name, a.id, a.assignedTo, a.serial, a.location, a.assetTag, a.product, a.manufacturer, a.department, a.invoice].join(" ").toLowerCase().includes(q))
      .filter(a => fType === "All" || a.type === fType)
      .filter(a => fStatus === "All" || a.status === fStatus)
      .sort((a, b) => {
        const va = a[sort.col] || "", vb = b[sort.col] || "";
        return sort.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [assets, search, fType, fStatus, sort]);

  const save = () => {
    if (!form.name.trim())   return setErr("Asset name is required.");
    if (!form.serial.trim()) return setErr("Serial number is required.");
    if (modal.mode === "add") {
      setAssets(p => [...p, { ...form, id: genId() }]);
      showToast("Asset added successfully.");
    } else {
      setAssets(p => p.map(a => a.id === modal.asset.id ? { ...form, id: a.id } : a));
      showToast("Asset updated.");
    }
    closeModal();
  };

  const doDelete = () => {
    setAssets(p => p.filter(a => a.id !== delTarget.id));
    showToast("Asset deleted.", "warn");
    setDelTarget(null);
    if (modal) closeModal();
  };

  const exportCSV = () => {
    const keys = ["id","product","manufacturer","name","assetTag","serial","acquisition","warranty","location","status","assignedTo","department","type","invoice"];
    const rows = [keys.join(","), ...filtered.map(a => keys.map(k => `"${(a[k]||"").replace(/"/g,'""')}"`).join(","))];
    const el = document.createElement("a");
    el.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    el.download = "it-assets.csv";
    el.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setCsvRaw(text);
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());
      const rows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.replace(/"/g, "").trim());
        const obj = {};
        headers.forEach((h, i) => obj[h] = vals[i] || "");
        return obj;
      });
      setCsvPreview(rows.slice(0, 5));
      setUploadModal(true);
    };
    reader.readAsText(file);
  };

  const confirmUpload = () => {
    const lines = csvRaw.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());
    const MAP = {
      "Product": "product", "Product Manufacturer": "manufacturer", "Asset Name": "name",
      "Asset Tag": "assetTag", "Serial Number": "serial", "Acquisition Date": "acquisition",
      "Warranty Expiry Date": "warranty", "Location": "location", "Asset State": "status",
      "Assign to User": "assignedTo", "Assign to Department": "department",
      "Asset Type": "type", "Invoice Number": "invoice"
    };
    const newAssets = lines.slice(1).map(line => {
      const vals = line.split(",").map(v => v.replace(/"/g, "").trim());
      const obj = { id: genId() };
      headers.forEach((h, i) => { const key = MAP[h] || h; obj[key] = vals[i] || ""; });
      return obj;
    });
    setAssets(p => [...p, ...newAssets]);
    showToast(`${newAssets.length} assets uploaded successfully!`);
    setUploadModal(false);
    setCsvPreview([]);
    setCsvRaw("");
  };

  const now = new Date();
  const isExpired  = d => d && new Date(d) < now;
  const isExpiring = d => { if (!d || isExpired(d)) return false; return (new Date(d) - now) / 86400000 <= 90; };

  const counts = useMemo(() => ({
    total:   assets.length,
    active:  assets.filter(a => a.status === "Active").length,
    repair:  assets.filter(a => a.status === "Under Repair").length,
    expired: assets.filter(a => isExpired(a.warranty)).length,
  // eslint-disable-next-line
  }), [assets]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      <header style={S.header}>
        <div style={S.hInner}>
          <div style={S.brand}>
            <div style={S.logoBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2.5"/><path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div>
              <div style={S.brandTitle}>IT Asset Tracker</div>
              <div style={S.brandSub}>Kushals Retail · Asset Registry</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <label className="btn-sec" style={{ cursor:"pointer" }}>
              ⬆ Upload CSV
              <input type="file" accept=".csv" style={{ display:"none" }} onChange={handleFileUpload} />
            </label>
            <button className="btn-sec" onClick={exportCSV}>⬇ Export CSV</button>
            <button className="btn-pri" onClick={openAdd}>+ Add Asset</button>
          </div>
        </div>
      </header>

      <main style={S.main}>
        <div style={S.cards}>
          {[
            { label:"Total Assets",     val:counts.total,   accent:"#0ea5e9" },
            { label:"Active",           val:counts.active,  accent:"#22c55e" },
            { label:"Under Repair",     val:counts.repair,  accent:"#f59e0b" },
            { label:"Warranty Expired", val:counts.expired, accent:"#f87171" },
          ].map(c => (
            <div key={c.label} style={{ ...S.card, borderTopColor: c.accent }}>
              <div style={{ fontSize:30, fontWeight:700, color:c.accent, lineHeight:1 }}>{c.val}</div>
              <div style={S.cardLabel}>{c.label}</div>
            </div>
          ))}
        </div>

        <div style={S.filters}>
          <div style={S.searchBox}>
            <svg style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="inp" style={{ paddingLeft:36 }} placeholder="Search by name, ID, serial, tag, assignee, department…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="inp sel" value={fType} onChange={e => setFType(e.target.value)} style={{ minWidth:160 }}>
            <option value="All">All Types</option>
            {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="inp sel" value={fStatus} onChange={e => setFStatus(e.target.value)} style={{ minWidth:150 }}>
            <option value="All">All States</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <span style={S.count}>{filtered.length} / {assets.length}</span>
        </div>

        <div style={S.tableWrap}>
          <div style={{ overflowX:"auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  {TABLE_COLS.map(c => (
                    <th key={c.key} className="th" onClick={() => doSort(c.key)}>
                      {c.label}
                      <span style={{ marginLeft:5, fontSize:9, opacity: sort.col===c.key ? 1 : .2 }}>
                        {sort.col===c.key ? (sort.dir==="asc" ? "▲" : "▼") : "▲"}
                      </span>
                    </th>
                  ))}
                  <th className="th" style={{ textAlign:"right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={TABLE_COLS.length + 1} style={{ padding:"60px 0", textAlign:"center", color:"#374151", fontSize:14 }}>No assets match your filters.</td></tr>
                  : filtered.map(a => (
                    <tr key={a.id} className="row">
                      <td className="td mono sky">{a.id}</td>
                      <td className="td"><span style={{ marginRight:6 }}>{TYPE_ICONS[a.type]||"📦"}</span><strong style={{ color:"#f9fafb" }}>{a.product}</strong></td>
                      <td className="td muted sm">{a.manufacturer || <Dash/>}</td>
                      <td className="td muted">{a.name || <Dash/>}</td>
                      <td className="td mono sm" style={{ color:"#a78bfa" }}>{a.assetTag || <Dash/>}</td>
                      <td className="td mono sm" style={{ color:"#94a3b8" }}>{a.serial || <Dash/>}</td>
                      <td className="td muted sm">{a.type}</td>
                      <td className="td"><StatusBadge s={a.status} /></td>
                      <td className="td muted">{a.assignedTo || <Dash/>}</td>
                      <td className="td muted sm">{a.department || <Dash/>}</td>
                      <td className="td muted sm">{a.location || <Dash/>}</td>
                      <td className="td muted sm">{a.acquisition || <Dash/>}</td>
                      <td className="td">
                        {a.warranty
                          ? <span className={isExpired(a.warranty) ? "wexp" : isExpiring(a.warranty) ? "woon" : "wnorm"}>
                              {isExpired(a.warranty) ? "⚠ " : isExpiring(a.warranty) ? "⏰ " : ""}{a.warranty}
                            </span>
                          : <Dash/>}
                      </td>
                      <td className="td muted sm">{a.invoice || <Dash/>}</td>
                      <td className="td" style={{ textAlign:"right" }}>
                        <button className="ico" title="Edit" onClick={() => openEdit(a)}>✏️</button>
                        <button className="ico danger" title="Delete" onClick={() => setDelTarget(a)}>🗑</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="overlay" onClick={closeModal}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700, fontSize:15, color:"#f9fafb" }}>
                {modal.mode === "add" ? "Add New Asset" : `Edit — ${modal.asset.id}`}
              </span>
              <button className="ico" onClick={closeModal} style={{ fontSize:22, lineHeight:1 }}>×</button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              {err && <div style={S.errBox}>{err}</div>}
              <div style={S.grid2}>
                <FField label="Product *"          val={form.product}      set={v=>f("product",v)}      ph="e.g. Dell XPS 15" />
                <FField label="Manufacturer"       val={form.manufacturer} set={v=>f("manufacturer",v)} ph="e.g. Dell" />
                <FField label="Asset Name *"       val={form.name}         set={v=>f("name",v)}         ph="e.g. Laptop - Ravi" />
                <FField label="Asset Tag"          val={form.assetTag}     set={v=>f("assetTag",v)}     ph="e.g. KFJ-TAG-001" />
                <FField label="Serial Number *"    val={form.serial}       set={v=>f("serial",v)}       ph="e.g. DXP-98761" />
                <FField label="Invoice Number"     val={form.invoice}      set={v=>f("invoice",v)}      ph="e.g. INV-2023-001" />
                <FSel   label="Asset Type"         val={form.type}         opts={ASSET_TYPES}            set={v=>f("type",v)} />
                <FSel   label="Asset State"        val={form.status}       opts={STATUSES}               set={v=>f("status",v)} />
                <FField label="Assigned To"        val={form.assignedTo}   set={v=>f("assignedTo",v)}   ph="Employee name" />
                <FField label="Department"         val={form.department}   set={v=>f("department",v)}   ph="e.g. IT, Finance" />
                <FField label="Location"           val={form.location}     set={v=>f("location",v)}     ph="Office / Branch" />
                <FField label="Acquisition Date"   val={form.acquisition}  set={v=>f("acquisition",v)}  type="date" />
                <FField label="Warranty Expiry"    val={form.warranty}     set={v=>f("warranty",v)}     type="date" />
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
                <button className="btn-sec" onClick={closeModal}>Cancel</button>
                <button className="btn-pri" onClick={save}>{modal.mode === "add" ? "Add Asset" : "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {delTarget && (
        <div className="overlay" onClick={() => setDelTarget(null)}>
          <div style={{ ...S.modal, maxWidth:400 }} onClick={e => e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700, color:"#f87171" }}>Delete Asset</span>
              <button className="ico" onClick={() => setDelTarget(null)} style={{ fontSize:22 }}>×</button>
            </div>
            <div style={{ padding:"20px 28px" }}>
              <p style={{ fontSize:14, color:"#9ca3af", lineHeight:1.8, marginBottom:20 }}>
                Permanently delete <strong style={{ color:"#f9fafb" }}>{delTarget.name || delTarget.product}</strong> ({delTarget.id})?<br/>This cannot be undone.
              </p>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button className="btn-sec" onClick={() => setDelTarget(null)}>Cancel</button>
                <button className="btn-del" onClick={doDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Preview Modal */}
      {uploadModal && (
        <div className="overlay" onClick={() => setUploadModal(false)}>
          <div style={{ ...S.modal, maxWidth:600 }} onClick={e => e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700, fontSize:15, color:"#f9fafb" }}>📂 Upload Preview</span>
              <button className="ico" onClick={() => setUploadModal(false)} style={{ fontSize:22 }}>×</button>
            </div>
            <div style={{ padding:"20px 28px" }}>
              <p style={{ fontSize:13, color:"#9ca3af", marginBottom:16 }}>
                Showing first 5 rows of your CSV. Click <strong style={{ color:"#f9fafb" }}>Confirm Upload</strong> to add all records.
              </p>
              <div style={{ overflowX:"auto", marginBottom:20 }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr>
                      {csvPreview[0] && Object.keys(csvPreview[0]).map(k => (
                        <th key={k} style={{ padding:"8px 10px", background:"#0d0d0f", color:"#52525b", textAlign:"left", whiteSpace:"nowrap", borderBottom:"1px solid #1c1c22" }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((v, j) => (
                          <td key={j} style={{ padding:"8px 10px", color:"#9ca3af", borderBottom:"1px solid #18181b", whiteSpace:"nowrap" }}>{v || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button className="btn-sec" onClick={() => setUploadModal(false)}>Cancel</button>
                <button className="btn-pri" onClick={confirmUpload}>✓ Confirm Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ ...S.toast, ...(toast.type==="warn" ? S.toastWarn : S.toastOk) }}>
          {toast.type === "warn" ? "🗑 " : "✓ "}{toast.msg}
        </div>
      )}
    </div>
  );
}

const StatusBadge = ({ s }) => {
  const m = STATUS_META[s] || STATUS_META["Active"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:m.bg, color:m.text, border:`1px solid ${m.border}` }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:m.dot }} />{s}
    </span>
  );
};
const Dash = () => <span style={{ color:"#374151" }}>—</span>;
const FField = ({ label, val, set, type="text", ph="" }) => (
  <div>
    <label style={S.lbl}>{label}</label>
    <input className="inp" type={type} value={val} placeholder={ph} onChange={e=>set(e.target.value)} />
  </div>
);
const FSel = ({ label, val, opts, set }) => (
  <div>
    <label style={S.lbl}>{label}</label>
    <select className="inp sel" value={val} onChange={e=>set(e.target.value)}>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const S = {
  page:       { fontFamily:"'Inter',system-ui,sans-serif", background:"#09090b", minHeight:"100vh", color:"#e5e7eb" },
  header:     { background:"#111113", borderBottom:"1px solid #1c1c22", position:"sticky", top:0, zIndex:50 },
  hInner:     { maxWidth:1400, margin:"0 auto", padding:"13px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" },
  brand:      { display:"flex", alignItems:"center", gap:12 },
  logoBox:    { width:40, height:40, background:"#0c1e30", border:"1px solid #0ea5e940", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" },
  brandTitle: { fontWeight:700, fontSize:15, color:"#f9fafb" },
  brandSub:   { fontSize:11, color:"#4b5563", marginTop:2, letterSpacing:.4 },
  main:       { maxWidth:1400, margin:"0 auto", padding:"28px" },
  cards:      { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 },
  card:       { background:"#111113", border:"1px solid #1c1c22", borderTop:"3px solid", borderRadius:10, padding:"18px 22px" },
  cardLabel:  { fontSize:11, color:"#6b7280", marginTop:6, letterSpacing:.4 },
  filters:    { display:"flex", gap:12, marginBottom:18, alignItems:"center", flexWrap:"wrap" },
  searchBox:  { position:"relative", flex:"1 1 260px", minWidth:220 },
  count:      { fontSize:12, color:"#4b5563", whiteSpace:"nowrap", marginLeft:"auto" },
  tableWrap:  { background:"#111113", border:"1px solid #1c1c22", borderRadius:12, overflow:"hidden" },
  table:      { width:"100%", borderCollapse:"collapse" },
  modal:      { background:"#18181b", border:"1px solid #27272a", borderRadius:14, width:750, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto" },
  mHead:      { padding:"20px 28px", borderBottom:"1px solid #1c1c22", display:"flex", justifyContent:"space-between", alignItems:"center" },
  grid2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  lbl:        { display:"block", fontSize:11, fontWeight:600, letterSpacing:.9, color:"#6b7280", textTransform:"uppercase", marginBottom:5 },
  errBox:     { background:"#1f0606", border:"1px solid #7f1d1d", borderRadius:6, padding:"10px 14px", marginBottom:16, color:"#fca5a5", fontSize:13 },
  toast:      { position:"fixed", bottom:28, right:28, padding:"12px 18px", borderRadius:8, fontSize:13, fontWeight:600, border:"1px solid", zIndex:999 },
  toastOk:    { background:"#052e16", borderColor:"#166534", color:"#4ade80" },
  toastWarn:  { background:"#2d0707", borderColor:"#991b1b", color:"#fca5a5" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:#09090b; }
  ::-webkit-scrollbar-thumb { background:#27272a; border-radius:3px; }
  .inp { width:100%; background:#09090b; border:1px solid #27272a; color:#f4f4f5; border-radius:7px; padding:9px 12px; font-size:13px; font-family:inherit; outline:none; transition:border .15s; }
  .inp:focus { border-color:#0ea5e9; box-shadow:0 0 0 2px #0ea5e918; }
  .inp::placeholder { color:#3f3f46; }
  .sel { cursor:pointer; }
  select option { background:#18181b; }
  .th { padding:11px 16px; text-align:left; font-size:11px; font-weight:600; letter-spacing:.9px; text-transform:uppercase; color:#52525b; background:#0d0d0f; cursor:pointer; white-space:nowrap; user-select:none; border-bottom:1px solid #1c1c22; }
  .th:hover { color:#a1a1aa; }
  .td { padding:13px 16px; font-size:13px; border-bottom:1px solid #18181b; vertical-align:middle; white-space:nowrap; }
  .row:last-child .td { border-bottom:none; }
  .row:hover .td { background:#111113; }
  .mono { font-family:ui-monospace,'Cascadia Code',monospace; font-size:12px; font-weight:600; }
  .sky { color:#0ea5e9; }
  .muted { color:#71717a; }
  .sm { font-size:12px; }
  .wexp { font-size:12px; color:#f87171; }
  .woon { font-size:12px; color:#fbbf24; }
  .wnorm { font-size:12px; color:#52525b; }
  .btn-pri { display:inline-flex; align-items:center; gap:6px; background:#0ea5e9; color:#fff; border:none; border-radius:7px; padding:9px 16px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:background .15s; }
  .btn-pri:hover { background:#38bdf8; }
  .btn-sec { display:inline-flex; align-items:center; gap:6px; background:transparent; color:#a1a1aa; border:1px solid #27272a; border-radius:7px; padding:9px 16px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; }
  .btn-sec:hover { border-color:#52525b; color:#f4f4f5; }
  .btn-del { background:#dc2626; color:#fff; border:none; border-radius:7px; padding:9px 16px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; }
  .btn-del:hover { background:#ef4444; }
  .ico { background:none; border:none; cursor:pointer; padding:5px 7px; border-radius:5px; font-size:14px; color:#52525b; transition:all .15s; }
  .ico:hover { background:#1c1c22; color:#f4f4f5; }
  .ico.danger:hover { background:#2d0707; }
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:100; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px); }
`;