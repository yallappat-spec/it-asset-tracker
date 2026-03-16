import { useState, useMemo } from "react";

// ─── IT ASSETS ────────────────────────────────────────────────────────────────
const ASSET_TYPES = ["Laptop","Desktop","Mobile Device","Server","Monitor","Keyboard/Mouse","Peripheral","Other"];
const TYPE_ICONS  = { "Laptop":"💻","Desktop":"🖥️","Mobile Device":"📱","Server":"🗄️","Monitor":"🖥","Keyboard/Mouse":"⌨️","Peripheral":"🔌","Other":"📦" };
const STATUSES    = ["Active","Under Repair","Retired","In Storage","Disposed"];

const STATUS_META = {
  "Active":       { bg:"#f0fdf4", border:"#bbf7d0", text:"#16a34a", dot:"#22c55e" },
  "Under Repair": { bg:"#fffbeb", border:"#fde68a", text:"#d97706", dot:"#f59e0b" },
  "Retired":      { bg:"#f9fafb", border:"#e5e7eb", text:"#6b7280", dot:"#9ca3af" },
  "In Storage":   { bg:"#eff6ff", border:"#bfdbfe", text:"#2563eb", dot:"#3b82f6" },
  "Disposed":     { bg:"#fef2f2", border:"#fecaca", text:"#dc2626", dot:"#f87171" },
};

const IT_SAMPLE = [
  { id:"AST-0001", product:"Dell XPS 15",        manufacturer:"Dell",     name:"Laptop - Ravi",    assetTag:"KFJ-TAG-001", serial:"DXP-98761",   acquisition:"2023-01-15", warranty:"2026-01-15", location:"Bangalore HQ", status:"Active",       assignedTo:"Ravi Kumar",   department:"IT",      type:"Laptop",         invoice:"INV-2023-001" },
  { id:"AST-0002", product:"MacBook Air M2",      manufacturer:"Apple",    name:"Laptop - Meena",   assetTag:"KFJ-TAG-002", serial:"MBA-M2-4421", acquisition:"2023-09-01", warranty:"2025-09-01", location:"Hyderabad",    status:"Active",       assignedTo:"Meena Sharma", department:"Finance", type:"Laptop",         invoice:"INV-2023-002" },
  { id:"AST-0003", product:"iPhone 14 Pro",       manufacturer:"Apple",    name:"Mobile - Arjun",   assetTag:"KFJ-TAG-003", serial:"IPH-14P-009", acquisition:"2023-06-10", warranty:"2025-06-10", location:"Chennai",      status:"Active",       assignedTo:"Arjun Nair",   department:"Sales",   type:"Mobile Device",  invoice:"INV-2023-003" },
  { id:"AST-0004", product:"HP ProLiant G10",     manufacturer:"HP",       name:"Server - IT",      assetTag:"KFJ-TAG-004", serial:"HPPL-0023",   acquisition:"2021-09-10", warranty:"2024-09-10", location:"Bangalore HQ", status:"Under Repair", assignedTo:"IT Team",      department:"IT",      type:"Server",         invoice:"INV-2021-004" },
  { id:"AST-0005", product:'Dell UltraSharp 27"', manufacturer:"Dell",     name:"Monitor - Store",  assetTag:"KFJ-TAG-005", serial:"DUS27-7890",  acquisition:"2022-11-05", warranty:"2025-11-05", location:"Mumbai WH",    status:"In Storage",   assignedTo:"",             department:"",        type:"Monitor",        invoice:"INV-2022-005" },
  { id:"AST-0006", product:"Logitech MX Keys",    manufacturer:"Logitech", name:"Keyboard - Priya", assetTag:"KFJ-TAG-006", serial:"LGT-MX-221",  acquisition:"2023-03-20", warranty:"2025-03-20", location:"Bangalore HQ", status:"Active",       assignedTo:"Priya Rao",    department:"HR",      type:"Keyboard/Mouse", invoice:"INV-2023-006" },
];

const IT_BLANK = { product:"", manufacturer:"", name:"", assetTag:"", serial:"", acquisition:"", warranty:"", location:"", status:"Active", assignedTo:"", department:"", type:"Laptop", invoice:"" };
let _itCounter = 7;
const genItId = () => `AST-${String(_itCounter++).padStart(4,"0")}`;

const IT_COLS = [
  { key:"id",           label:"ID" },
  { key:"product",      label:"Product" },
  { key:"manufacturer", label:"Manufacturer" },
  { key:"name",         label:"Asset Name" },
  { key:"assetTag",     label:"Asset Tag" },
  { key:"serial",       label:"Serial Number" },
  { key:"type",         label:"Asset Type" },
  { key:"status",       label:"Asset State" },
  { key:"assignedTo",   label:"Assigned To" },
  { key:"department",   label:"Department" },
  { key:"location",     label:"Location" },
  { key:"acquisition",  label:"Acquisition Date" },
  { key:"warranty",     label:"Warranty Expiry" },
  { key:"invoice",      label:"Invoice Number" },
];

// ─── STUDIO INVENTORY ─────────────────────────────────────────────────────────
const UNIT_TYPES = ["Piece","Set","Pair","Box","Roll","Meter","Kit","Pack","Unit","Other"];

const ST_SAMPLE = [
  { id:"STD-0001", particulars:"Sony A7 IV Camera Body",      qty:"2",  unitPrice:"2,50,000", unitType:"Piece", assetCode:"KFJ-STD-001", vendorName:"Sony India Pvt Ltd",   invoiceDate:"2023-03-10", invoiceNumber:"INV-STD-001" },
  { id:"STD-0002", particulars:"Canon 24-70mm f/2.8 Lens",    qty:"3",  unitPrice:"95,000",   unitType:"Piece", assetCode:"KFJ-STD-002", vendorName:"Canon India",          invoiceDate:"2023-05-15", invoiceNumber:"INV-STD-002" },
  { id:"STD-0003", particulars:"Godox SL-200W LED Light",     qty:"6",  unitPrice:"18,500",   unitType:"Piece", assetCode:"KFJ-STD-003", vendorName:"Godox Distributor",    invoiceDate:"2023-01-20", invoiceNumber:"INV-STD-003" },
  { id:"STD-0004", particulars:"Rode NTG3 Shotgun Mic",       qty:"2",  unitPrice:"32,000",   unitType:"Piece", assetCode:"KFJ-STD-004", vendorName:"Audio House",          invoiceDate:"2023-07-01", invoiceNumber:"INV-STD-004" },
  { id:"STD-0005", particulars:"Manfrotto 504X Tripod",       qty:"4",  unitPrice:"22,000",   unitType:"Set",   assetCode:"KFJ-STD-005", vendorName:"Photo Gear India",     invoiceDate:"2022-11-10", invoiceNumber:"INV-STD-005" },
];

const ST_BLANK = { particulars:"", qty:"", unitPrice:"", unitType:"Piece", assetCode:"", vendorName:"", invoiceDate:"", invoiceNumber:"" };
let _stCounter = 6;
const genStId = () => `STD-${String(_stCounter++).padStart(4,"0")}`;

const ST_COLS = [
  { key:"id",            label:"ID" },
  { key:"particulars",   label:"Particulars" },
  { key:"qty",           label:"Qty" },
  { key:"unitPrice",     label:"Unit Price" },
  { key:"unitType",      label:"Unit Type" },
  { key:"total",         label:"Total" },
  { key:"assetCode",     label:"Asset Code" },
  { key:"vendorName",    label:"Vendor Name" },
  { key:"invoiceDate",   label:"Invoice Date" },
  { key:"invoiceNumber", label:"Invoice Number" },
];

const calcTotal = (qty, unitPrice) => {
  const q = parseFloat((qty||"").toString().replace(/,/g,"")) || 0;
  const p = parseFloat((unitPrice||"").toString().replace(/,/g,"")) || 0;
  if (!q || !p) return "—";
  return (q * p).toLocaleString("en-IN");
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("it");

  // ── IT state ──
  const [assets, setAssets]             = useState(IT_SAMPLE);
  const [itSearch, setItSearch]         = useState("");
  const [fType, setFType]               = useState("All");
  const [fStatus, setFStatus]           = useState("All");
  const [itSort, setItSort]             = useState({ col:"id", dir:"asc" });
  const [itModal, setItModal]           = useState(null);
  const [itForm, setItForm]             = useState(IT_BLANK);
  const [itErr, setItErr]               = useState("");
  const [itDel, setItDel]               = useState(null);
  const [itUpload, setItUpload]         = useState(false);
  const [itCsvPreview, setItCsvPreview] = useState([]);
  const [itCsvRaw, setItCsvRaw]         = useState("");

  // ── Studio state ──
  const [studio, setStudio]             = useState(ST_SAMPLE);
  const [stSearch, setStSearch]         = useState("");
  const [fVendor, setFVendor]           = useState("All");
  const [stSort, setStSort]             = useState({ col:"id", dir:"asc" });
  const [stModal, setStModal]           = useState(null);
  const [stForm, setStForm]             = useState(ST_BLANK);
  const [stErr, setStErr]               = useState("");
  const [stDel, setStDel]               = useState(null);
  const [stUpload, setStUpload]         = useState(false);
  const [stCsvPreview, setStCsvPreview] = useState([]);
  const [stCsvRaw, setStCsvRaw]         = useState("");

  const [toast, setToast] = useState(null);

  const showToast = (msg, type="ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2600); };
  const now = new Date();
  const isExpired  = d => d && new Date(d) < now;
  const isExpiring = d => { if (!d || isExpired(d)) return false; return (new Date(d) - now) / 86400000 <= 90; };

  // ── IT logic ──
  const itFiltered = useMemo(() => {
    const q = itSearch.toLowerCase();
    return [...assets]
      .filter(a => !q || [a.name,a.id,a.assignedTo,a.serial,a.location,a.assetTag,a.product,a.manufacturer,a.department,a.invoice].join(" ").toLowerCase().includes(q))
      .filter(a => fType==="All" || a.type===fType)
      .filter(a => fStatus==="All" || a.status===fStatus)
      .sort((a,b) => { const va=a[itSort.col]||"",vb=b[itSort.col]||""; return itSort.dir==="asc"?va.localeCompare(vb):vb.localeCompare(va); });
  }, [assets, itSearch, fType, fStatus, itSort]);

  const itCounts = useMemo(() => ({
    total:   assets.length,
    active:  assets.filter(a=>a.status==="Active").length,
    repair:  assets.filter(a=>a.status==="Under Repair").length,
    expired: assets.filter(a=>isExpired(a.warranty)).length,
  // eslint-disable-next-line
  }), [assets]);

  const saveIt = () => {
    if (!itForm.name.trim())   return setItErr("Asset name is required.");
    if (!itForm.serial.trim()) return setItErr("Serial number is required.");
    if (itModal.mode==="add") { setAssets(p=>[...p,{...itForm,id:genItId()}]); showToast("Asset added."); }
    else { setAssets(p=>p.map(a=>a.id===itModal.asset.id?{...itForm,id:a.id}:a)); showToast("Asset updated."); }
    setItModal(null);
  };
  const deleteIt = () => { setAssets(p=>p.filter(a=>a.id!==itDel.id)); showToast("Asset deleted.","warn"); setItDel(null); if(itModal) setItModal(null); };

  const exportItCSV = () => {
    const keys = ["id","product","manufacturer","name","assetTag","serial","acquisition","warranty","location","status","assignedTo","department","type","invoice"];
    const rows = [keys.join(","), ...itFiltered.map(a=>keys.map(k=>`"${(a[k]||"").replace(/"/g,'""')}"`).join(","))];
    dl(rows.join("\n"), "it-assets.csv");
  };

  const handleItUpload = e => {
    const file = e.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = ev => {
      const text = ev.target.result; setItCsvRaw(text);
      const lines = text.trim().split("\n");
      const hdr = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
      setItCsvPreview(lines.slice(1,6).map(line=>{ const v=line.split(",").map(x=>x.replace(/"/g,"").trim()); const o={}; hdr.forEach((h,i)=>o[h]=v[i]||""); return o; }));
      setItUpload(true);
    };
    r.readAsText(file);
  };

  const confirmItUpload = () => {
    const lines = itCsvRaw.trim().split("\n");
    const hdr = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
    const MAP = { "Product":"product","Product Manufacturer":"manufacturer","Asset Name":"name","Asset Tag":"assetTag","Serial Number":"serial","Acquisition Date":"acquisition","Warranty Expiry Date":"warranty","Location":"location","Asset State":"status","Assign to User":"assignedTo","Assign to Department":"department","Asset Type":"type","Invoice Number":"invoice" };
    const items = lines.slice(1).map(line=>{ const v=line.split(",").map(x=>x.replace(/"/g,"").trim()); const o={id:genItId()}; hdr.forEach((h,i)=>{ o[MAP[h]||h]=v[i]||""; }); return o; });
    setAssets(p=>[...p,...items]); showToast(`${items.length} assets uploaded!`); setItUpload(false); setItCsvPreview([]); setItCsvRaw("");
  };

  const fi = (k,v) => setItForm(p=>({...p,[k]:v}));

  // ── Studio logic ──
  const stVendors = useMemo(() => ["All",...new Set(studio.map(a=>a.vendorName).filter(Boolean))], [studio]);

  const stFiltered = useMemo(() => {
    const q = stSearch.toLowerCase();
    return [...studio]
      .filter(a => !q || [a.particulars,a.id,a.assetCode,a.vendorName,a.invoiceNumber].join(" ").toLowerCase().includes(q))
      .filter(a => fVendor==="All" || a.vendorName===fVendor)
      .sort((a,b) => { const va=a[stSort.col]||"",vb=b[stSort.col]||""; return stSort.dir==="asc"?va.localeCompare(vb):vb.localeCompare(va); });
  }, [studio, stSearch, fVendor, stSort]);

  const stCounts = useMemo(() => {
    const totalQty   = studio.reduce((s,a)=>s+(parseFloat((a.qty||"").replace(/,/g,""))||0), 0);
    const totalValue = studio.reduce((s,a)=>{
      const q = parseFloat((a.qty||"").toString().replace(/,/g,""))||0;
      const p = parseFloat((a.unitPrice||"").toString().replace(/,/g,""))||0;
      return s + q*p;
    }, 0);
    const vendors = new Set(studio.map(a=>a.vendorName).filter(Boolean)).size;
    return { records: studio.length, totalQty, totalValue, vendors };
  }, [studio]);

  const saveSt = () => {
    if (!stForm.particulars.trim()) return setStErr("Particulars is required.");
    if (!stForm.qty.trim())         return setStErr("Qty is required.");
    if (stModal.mode==="add") { setStudio(p=>[...p,{...stForm,id:genStId()}]); showToast("Item added."); }
    else { setStudio(p=>p.map(a=>a.id===stModal.asset.id?{...stForm,id:a.id}:a)); showToast("Item updated."); }
    setStModal(null);
  };
  const deleteSt = () => { setStudio(p=>p.filter(a=>a.id!==stDel.id)); showToast("Item deleted.","warn"); setStDel(null); if(stModal) setStModal(null); };

  const exportStCSV = () => {
    const keys = ["id","particulars","qty","unitPrice","unitType","assetCode","vendorName","invoiceDate","invoiceNumber"];
    const rows = [keys.join(","), ...stFiltered.map(a=>keys.map(k=>`"${(a[k]||"").replace(/"/g,'""')}"`).join(","))];
    dl(rows.join("\n"), "studio-inventory.csv");
  };

  const handleStUpload = e => {
    const file = e.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = ev => {
      const text = ev.target.result; setStCsvRaw(text);
      const lines = text.trim().split("\n");
      const hdr = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
      setStCsvPreview(lines.slice(1,6).map(line=>{ const v=line.split(",").map(x=>x.replace(/"/g,"").trim()); const o={}; hdr.forEach((h,i)=>o[h]=v[i]||""); return o; }));
      setStUpload(true);
    };
    r.readAsText(file);
  };

  const confirmStUpload = () => {
    const lines = stCsvRaw.trim().split("\n");
    const hdr = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
    const MAP = { "Particulars":"particulars","Qty":"qty","Unit Price":"unitPrice","Unit type":"unitType","Total":"total","Asset Code":"assetCode","Vendor Name":"vendorName","Invoice Date":"invoiceDate","Invoice Number":"invoiceNumber" };
    const items = lines.slice(1).map(line=>{ const v=line.split(",").map(x=>x.replace(/"/g,"").trim()); const o={id:genStId()}; hdr.forEach((h,i)=>{ o[MAP[h]||h]=v[i]||""; }); return o; });
    setStudio(p=>[...p,...items]); showToast(`${items.length} items uploaded!`); setStUpload(false); setStCsvPreview([]); setStCsvRaw("");
  };

  const fs = (k,v) => setStForm(p=>({...p,[k]:v}));

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.hInner}>
          <div style={S.brand}>
            <div style={S.logoBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2.5"/><path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div>
              <div style={S.brandTitle}>Kushals Retail</div>
              <div style={S.brandSub}>Asset & Inventory Registry</div>
            </div>
          </div>

          <div style={S.tabs}>
            <button className={activeTab==="it"?"tab tab-active":"tab"} onClick={()=>setActiveTab("it")}>💻 IT Assets</button>
            <button className={activeTab==="studio"?"tab tab-active":"tab"} onClick={()=>setActiveTab("studio")}>🎬 Studio Inventory</button>
          </div>

          {activeTab==="it" ? (
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <label className="btn-sec" style={{ cursor:"pointer" }}>⬆ Upload CSV<input type="file" accept=".csv" style={{ display:"none" }} onChange={handleItUpload}/></label>
              <button className="btn-sec" onClick={exportItCSV}>⬇ Export CSV</button>
              <button className="btn-pri" onClick={()=>{ setItForm(IT_BLANK); setItErr(""); setItModal({mode:"add"}); }}>+ Add Asset</button>
            </div>
          ) : (
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <label className="btn-sec" style={{ cursor:"pointer" }}>⬆ Upload CSV<input type="file" accept=".csv" style={{ display:"none" }} onChange={handleStUpload}/></label>
              <button className="btn-sec" onClick={exportStCSV}>⬇ Export CSV</button>
              <button style={S.btnPurple} onClick={()=>{ setStForm(ST_BLANK); setStErr(""); setStModal({mode:"add"}); }}>+ Add Item</button>
            </div>
          )}
        </div>
      </header>

      {/* ══════════════ IT ASSETS TAB ══════════════ */}
      {activeTab==="it" && (
        <main style={S.main}>
          <div style={S.cards}>
            {[
              { label:"Total Assets",     val:itCounts.total,   accent:"#0ea5e9" },
              { label:"Active",           val:itCounts.active,  accent:"#22c55e" },
              { label:"Under Repair",     val:itCounts.repair,  accent:"#f59e0b" },
              { label:"Warranty Expired", val:itCounts.expired, accent:"#f87171" },
            ].map(c=>(
              <div key={c.label} style={{ ...S.card, borderTopColor:c.accent }}>
                <div style={{ fontSize:30,fontWeight:700,color:c.accent,lineHeight:1 }}>{c.val}</div>
                <div style={S.cardLabel}>{c.label}</div>
              </div>
            ))}
          </div>

          <div style={S.filters}>
            <div style={S.searchBox}>
              <SearchIcon/>
              <input className="inp" style={{ paddingLeft:36 }} placeholder="Search by name, ID, serial, tag, assignee…" value={itSearch} onChange={e=>setItSearch(e.target.value)}/>
            </div>
            <select className="inp sel" value={fType} onChange={e=>setFType(e.target.value)} style={{ minWidth:160 }}>
              <option value="All">All Types</option>
              {ASSET_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <select className="inp sel" value={fStatus} onChange={e=>setFStatus(e.target.value)} style={{ minWidth:150 }}>
              <option value="All">All States</option>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <span style={S.count}>{itFiltered.length} / {assets.length}</span>
          </div>

          <div style={S.tableWrap}>
            <div style={{ overflowX:"auto" }}>
              <table style={S.table}>
                <thead><tr>
                  {IT_COLS.map(c=>(
                    <th key={c.key} className="th" onClick={()=>setItSort(s=>({col:c.key,dir:s.col===c.key&&s.dir==="asc"?"desc":"asc"}))}>
                      {c.label}<SortArrow active={itSort.col===c.key} dir={itSort.dir}/>
                    </th>
                  ))}
                  <th className="th" style={{ textAlign:"right" }}>Actions</th>
                </tr></thead>
                <tbody>
                  {itFiltered.length===0
                    ? <tr><td colSpan={IT_COLS.length+1} style={{ padding:"60px 0",textAlign:"center",color:"#94a3b8",fontSize:14 }}>No assets match your filters.</td></tr>
                    : itFiltered.map(a=>(
                      <tr key={a.id} className="row">
                        <td className="td mono sky">{a.id}</td>
                        <td className="td"><span style={{ marginRight:6 }}>{TYPE_ICONS[a.type]||"📦"}</span><strong style={{ color:"#0f172a" }}>{a.product}</strong></td>
                        <td className="td muted sm">{a.manufacturer||<Dash/>}</td>
                        <td className="td muted">{a.name||<Dash/>}</td>
                        <td className="td mono sm" style={{ color:"#a78bfa" }}>{a.assetTag||<Dash/>}</td>
                        <td className="td mono sm" style={{ color:"#64748b" }}>{a.serial||<Dash/>}</td>
                        <td className="td muted sm">{a.type}</td>
                        <td className="td"><StatusBadge s={a.status} meta={STATUS_META}/></td>
                        <td className="td muted">{a.assignedTo||<Dash/>}</td>
                        <td className="td muted sm">{a.department||<Dash/>}</td>
                        <td className="td muted sm">{a.location||<Dash/>}</td>
                        <td className="td muted sm">{a.acquisition||<Dash/>}</td>
                        <td className="td">
                          {a.warranty
                            ? <span className={isExpired(a.warranty)?"wexp":isExpiring(a.warranty)?"woon":"wnorm"}>
                                {isExpired(a.warranty)?"⚠ ":isExpiring(a.warranty)?"⏰ ":""}{a.warranty}
                              </span>
                            : <Dash/>}
                        </td>
                        <td className="td muted sm">{a.invoice||<Dash/>}</td>
                        <td className="td" style={{ textAlign:"right" }}>
                          <button className="ico" title="Edit" onClick={()=>{ setItForm({...a}); setItErr(""); setItModal({mode:"edit",asset:a}); }}>✏️</button>
                          <button className="ico danger" title="Delete" onClick={()=>setItDel(a)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* ══════════════ STUDIO INVENTORY TAB ══════════════ */}
      {activeTab==="studio" && (
        <main style={S.main}>
          <div style={S.cards}>
            {[
              { label:"Total Records",  val:stCounts.records,                                       accent:"#8b5cf6" },
              { label:"Total Qty",      val:stCounts.totalQty.toLocaleString("en-IN"),               accent:"#0ea5e9" },
              { label:"Total Value",    val:"₹"+stCounts.totalValue.toLocaleString("en-IN"),         accent:"#22c55e" },
              { label:"Vendors",        val:stCounts.vendors,                                        accent:"#f59e0b" },
            ].map(c=>(
              <div key={c.label} style={{ ...S.card, borderTopColor:c.accent }}>
                <div style={{ fontSize:c.label==="Total Value"?20:30, fontWeight:700, color:c.accent, lineHeight:1 }}>{c.val}</div>
                <div style={S.cardLabel}>{c.label}</div>
              </div>
            ))}
          </div>

          <div style={S.filters}>
            <div style={S.searchBox}>
              <SearchIcon/>
              <input className="inp" style={{ paddingLeft:36 }} placeholder="Search by particulars, asset code, vendor, invoice…" value={stSearch} onChange={e=>setStSearch(e.target.value)}/>
            </div>
            <select className="inp sel" value={fVendor} onChange={e=>setFVendor(e.target.value)} style={{ minWidth:200 }}>
              {stVendors.map(v=><option key={v} value={v}>{v==="All"?"All Vendors":v}</option>)}
            </select>
            <span style={S.count}>{stFiltered.length} / {studio.length}</span>
          </div>

          <div style={S.tableWrap}>
            <div style={{ overflowX:"auto" }}>
              <table style={S.table}>
                <thead><tr>
                  {ST_COLS.map(c=>(
                    <th key={c.key} className="th" onClick={()=>setStSort(s=>({col:c.key,dir:s.col===c.key&&s.dir==="asc"?"desc":"asc"}))}>
                      {c.label}<SortArrow active={stSort.col===c.key} dir={stSort.dir}/>
                    </th>
                  ))}
                  <th className="th" style={{ textAlign:"right" }}>Actions</th>
                </tr></thead>
                <tbody>
                  {stFiltered.length===0
                    ? <tr><td colSpan={ST_COLS.length+1} style={{ padding:"60px 0",textAlign:"center",color:"#94a3b8",fontSize:14 }}>No items match your filters.</td></tr>
                    : stFiltered.map(a=>(
                      <tr key={a.id} className="row">
                        <td className="td mono" style={{ color:"#8b5cf6" }}>{a.id}</td>
                        <td className="td"><strong style={{ color:"#0f172a" }}>{a.particulars}</strong></td>
                        <td className="td" style={{ textAlign:"right", color:"#334155", fontWeight:600 }}>{a.qty||<Dash/>}</td>
                        <td className="td" style={{ textAlign:"right", color:"#334155" }}>{a.unitPrice ? `₹${a.unitPrice}` : <Dash/>}</td>
                        <td className="td muted sm">{a.unitType||<Dash/>}</td>
                        <td className="td" style={{ textAlign:"right", color:"#16a34a", fontWeight:600 }}>
                          {calcTotal(a.qty, a.unitPrice)==="—" ? <Dash/> : `₹${calcTotal(a.qty, a.unitPrice)}`}
                        </td>
                        <td className="td mono sm" style={{ color:"#a78bfa" }}>{a.assetCode||<Dash/>}</td>
                        <td className="td muted">{a.vendorName||<Dash/>}</td>
                        <td className="td muted sm">{a.invoiceDate||<Dash/>}</td>
                        <td className="td mono sm" style={{ color:"#64748b" }}>{a.invoiceNumber||<Dash/>}</td>
                        <td className="td" style={{ textAlign:"right" }}>
                          <button className="ico" title="Edit" onClick={()=>{ setStForm({...a}); setStErr(""); setStModal({mode:"edit",asset:a}); }}>✏️</button>
                          <button className="ico danger" title="Delete" onClick={()=>setStDel(a)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* ══ IT Add/Edit Modal ══ */}
      {itModal && (
        <div className="overlay" onClick={()=>setItModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>{itModal.mode==="add"?"Add New Asset":`Edit — ${itModal.asset.id}`}</span>
              <button className="ico" onClick={()=>setItModal(null)} style={{ fontSize:22,lineHeight:1 }}>×</button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              {itErr && <div style={S.errBox}>{itErr}</div>}
              <div style={S.grid2}>
                <FField label="Product *"        val={itForm.product}      set={v=>fi("product",v)}      ph="e.g. Dell XPS 15"/>
                <FField label="Manufacturer"     val={itForm.manufacturer} set={v=>fi("manufacturer",v)} ph="e.g. Dell"/>
                <FField label="Asset Name *"     val={itForm.name}         set={v=>fi("name",v)}         ph="e.g. Laptop - Ravi"/>
                <FField label="Asset Tag"        val={itForm.assetTag}     set={v=>fi("assetTag",v)}     ph="e.g. KFJ-TAG-001"/>
                <FField label="Serial Number *"  val={itForm.serial}       set={v=>fi("serial",v)}       ph="e.g. DXP-98761"/>
                <FField label="Invoice Number"   val={itForm.invoice}      set={v=>fi("invoice",v)}      ph="e.g. INV-2023-001"/>
                <FSel   label="Asset Type"       val={itForm.type}         opts={ASSET_TYPES}             set={v=>fi("type",v)}/>
                <FSel   label="Asset State"      val={itForm.status}       opts={STATUSES}                set={v=>fi("status",v)}/>
                <FField label="Assigned To"      val={itForm.assignedTo}   set={v=>fi("assignedTo",v)}   ph="Employee name"/>
                <FField label="Department"       val={itForm.department}   set={v=>fi("department",v)}   ph="e.g. IT, Finance"/>
                <FField label="Location"         val={itForm.location}     set={v=>fi("location",v)}     ph="Office / Branch"/>
                <FField label="Acquisition Date" val={itForm.acquisition}  set={v=>fi("acquisition",v)}  type="date"/>
                <FField label="Warranty Expiry"  val={itForm.warranty}     set={v=>fi("warranty",v)}     type="date"/>
              </div>
              <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:22 }}>
                <button className="btn-sec" onClick={()=>setItModal(null)}>Cancel</button>
                <button className="btn-pri" onClick={saveIt}>{itModal.mode==="add"?"Add Asset":"Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Studio Add/Edit Modal ══ */}
      {stModal && (
        <div className="overlay" onClick={()=>setStModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>{stModal.mode==="add"?"Add Studio Item":`Edit — ${stModal.asset.id}`}</span>
              <button className="ico" onClick={()=>setStModal(null)} style={{ fontSize:22,lineHeight:1 }}>×</button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              {stErr && <div style={S.errBox}>{stErr}</div>}
              <div style={S.grid2}>
                <div style={{ gridColumn:"1/-1" }}>
                  <FField label="Particulars *"  val={stForm.particulars}   set={v=>fs("particulars",v)}   ph="Item description"/>
                </div>
                <FField label="Qty *"            val={stForm.qty}           set={v=>fs("qty",v)}           ph="e.g. 5"/>
                <FField label="Unit Price"       val={stForm.unitPrice}     set={v=>fs("unitPrice",v)}     ph="e.g. 25000"/>
                <FSel   label="Unit Type"        val={stForm.unitType}      opts={UNIT_TYPES}              set={v=>fs("unitType",v)}/>
                <div style={{ display:"flex",alignItems:"flex-end",paddingBottom:2 }}>
                  <div style={{ width:"100%" }}>
                    <label style={S.lbl}>Total (auto-calculated)</label>
                    <div style={{ ...S.calcBox }}>
                      {calcTotal(stForm.qty, stForm.unitPrice)==="—" ? "—" : `₹ ${calcTotal(stForm.qty, stForm.unitPrice)}`}
                    </div>
                  </div>
                </div>
                <FField label="Asset Code"       val={stForm.assetCode}     set={v=>fs("assetCode",v)}     ph="e.g. KFJ-STD-001"/>
                <FField label="Vendor Name"      val={stForm.vendorName}    set={v=>fs("vendorName",v)}    ph="e.g. Sony India"/>
                <FField label="Invoice Date"     val={stForm.invoiceDate}   set={v=>fs("invoiceDate",v)}   type="date"/>
                <FField label="Invoice Number"   val={stForm.invoiceNumber} set={v=>fs("invoiceNumber",v)} ph="e.g. INV-STD-001"/>
              </div>
              <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:22 }}>
                <button className="btn-sec" onClick={()=>setStModal(null)}>Cancel</button>
                <button style={S.btnPurple} onClick={saveSt}>{stModal.mode==="add"?"Add Item":"Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ IT Delete ══ */}
      {itDel && (
        <div className="overlay" onClick={()=>setItDel(null)}>
          <div style={{ ...S.modal,maxWidth:400 }} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,color:"#dc2626" }}>Delete Asset</span>
              <button className="ico" onClick={()=>setItDel(null)} style={{ fontSize:22 }}>×</button>
            </div>
            <div style={{ padding:"20px 28px" }}>
              <p style={{ fontSize:14,color:"#64748b",lineHeight:1.8,marginBottom:20 }}>
                Permanently delete <strong style={{ color:"#0f172a" }}>{itDel.name||itDel.product}</strong> ({itDel.id})?<br/>This cannot be undone.
              </p>
              <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
                <button className="btn-sec" onClick={()=>setItDel(null)}>Cancel</button>
                <button className="btn-del" onClick={deleteIt}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Studio Delete ══ */}
      {stDel && (
        <div className="overlay" onClick={()=>setStDel(null)}>
          <div style={{ ...S.modal,maxWidth:400 }} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,color:"#dc2626" }}>Delete Item</span>
              <button className="ico" onClick={()=>setStDel(null)} style={{ fontSize:22 }}>×</button>
            </div>
            <div style={{ padding:"20px 28px" }}>
              <p style={{ fontSize:14,color:"#64748b",lineHeight:1.8,marginBottom:20 }}>
                Permanently delete <strong style={{ color:"#0f172a" }}>{stDel.particulars}</strong> ({stDel.id})?<br/>This cannot be undone.
              </p>
              <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
                <button className="btn-sec" onClick={()=>setStDel(null)}>Cancel</button>
                <button className="btn-del" onClick={deleteSt}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ IT CSV Preview ══ */}
      {itUpload && (
        <div className="overlay" onClick={()=>setItUpload(false)}>
          <div style={{ ...S.modal,maxWidth:600 }} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>📂 IT Assets — Upload Preview</span>
              <button className="ico" onClick={()=>setItUpload(false)} style={{ fontSize:22 }}>×</button>
            </div>
            <CsvPreview rows={itCsvPreview} onCancel={()=>setItUpload(false)} onConfirm={confirmItUpload}/>
          </div>
        </div>
      )}

      {/* ══ Studio CSV Preview ══ */}
      {stUpload && (
        <div className="overlay" onClick={()=>setStUpload(false)}>
          <div style={{ ...S.modal,maxWidth:600 }} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>📂 Studio Inventory — Upload Preview</span>
              <button className="ico" onClick={()=>setStUpload(false)} style={{ fontSize:22 }}>×</button>
            </div>
            <CsvPreview rows={stCsvPreview} onCancel={()=>setStUpload(false)} onConfirm={confirmStUpload}/>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ ...S.toast,...(toast.type==="warn"?S.toastWarn:S.toastOk) }}>
          {toast.type==="warn"?"🗑 ":"✓ "}{toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const dl = (content, filename) => {
  const el = document.createElement("a");
  el.href = URL.createObjectURL(new Blob([content],{type:"text/csv"}));
  el.download = filename; el.click();
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const StatusBadge = ({ s, meta }) => {
  const m = (meta||{})[s] || { bg:"#f9fafb",border:"#e5e7eb",text:"#6b7280",dot:"#9ca3af" };
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:m.bg,color:m.text,border:`1px solid ${m.border}` }}>
      <span style={{ width:6,height:6,borderRadius:"50%",background:m.dot }}/>{s}
    </span>
  );
};

const CsvPreview = ({ rows, onCancel, onConfirm }) => (
  <div style={{ padding:"20px 28px" }}>
    <p style={{ fontSize:13,color:"#64748b",marginBottom:16 }}>
      Showing first 5 rows. Click <strong style={{ color:"#0f172a" }}>Confirm Upload</strong> to add all records.
    </p>
    <div style={{ overflowX:"auto",marginBottom:20 }}>
      <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
        <thead><tr>
          {rows[0] && Object.keys(rows[0]).map(k=>(
            <th key={k} style={{ padding:"8px 10px",background:"#f8fafc",color:"#94a3b8",textAlign:"left",whiteSpace:"nowrap",borderBottom:"1px solid #e2e8f0" }}>{k}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i}>{Object.values(row).map((v,j)=>(
              <td key={j} style={{ padding:"8px 10px",color:"#64748b",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap" }}>{v||"—"}</td>
            ))}</tr>
          ))}
        </tbody>
      </table>
    </div>
    <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
      <button className="btn-sec" onClick={onCancel}>Cancel</button>
      <button className="btn-pri" onClick={onConfirm}>✓ Confirm Upload</button>
    </div>
  </div>
);

const SearchIcon = () => (
  <svg style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const SortArrow = ({ active, dir }) => (
  <span style={{ marginLeft:5,fontSize:9,opacity:active?1:.2 }}>{active?(dir==="asc"?"▲":"▼"):"▲"}</span>
);

const Dash  = () => <span style={{ color:"#cbd5e1" }}>—</span>;
const FField = ({ label, val, set, type="text", ph="" }) => (
  <div>
    <label style={S.lbl}>{label}</label>
    <input className="inp" type={type} value={val} placeholder={ph} onChange={e=>set(e.target.value)}/>
  </div>
);
const FSel = ({ label, val, opts, set }) => (
  <div>
    <label style={S.lbl}>{label}</label>
    <select className="inp sel" value={val} onChange={e=>set(e.target.value)}>
      {opts.map(o=><option key={o}>{o}</option>)}
    </select>
  </div>
);

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  page:      { fontFamily:"'Inter',system-ui,sans-serif", background:"#f0f4f8", minHeight:"100vh", color:"#1e293b" },
  header:    { background:"#ffffff", borderBottom:"1px solid #e2e8f0", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,.06)" },
  hInner:    { maxWidth:1500, margin:"0 auto", padding:"10px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:20 },
  brand:     { display:"flex", alignItems:"center", gap:12, flexShrink:0 },
  logoBox:   { width:40, height:40, background:"#e0f2fe", border:"1px solid #bae6fd", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" },
  brandTitle:{ fontWeight:700, fontSize:15, color:"#0f172a" },
  brandSub:  { fontSize:11, color:"#94a3b8", marginTop:2, letterSpacing:.4 },
  tabs:      { display:"flex", gap:4, background:"#f1f5f9", borderRadius:10, padding:4 },
  main:      { maxWidth:1500, margin:"0 auto", padding:"28px" },
  cards:     { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 },
  card:      { background:"#ffffff", border:"1px solid #e2e8f0", borderTop:"3px solid", borderRadius:10, padding:"18px 22px", boxShadow:"0 1px 3px rgba(0,0,0,.04)" },
  cardLabel: { fontSize:11, color:"#94a3b8", marginTop:6, letterSpacing:.4 },
  filters:   { display:"flex", gap:12, marginBottom:18, alignItems:"center", flexWrap:"wrap" },
  searchBox: { position:"relative", flex:"1 1 260px", minWidth:220 },
  count:     { fontSize:12, color:"#94a3b8", whiteSpace:"nowrap", marginLeft:"auto" },
  tableWrap: { background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,.04)" },
  table:     { width:"100%", borderCollapse:"collapse" },
  modal:     { background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:14, width:780, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.12)" },
  mHead:     { padding:"20px 28px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" },
  grid2:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  lbl:       { display:"block", fontSize:11, fontWeight:600, letterSpacing:.9, color:"#94a3b8", textTransform:"uppercase", marginBottom:5 },
  calcBox:   { background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:7, padding:"9px 12px", fontSize:13, color:"#16a34a", fontWeight:700 },
  errBox:    { background:"#fef2f2", border:"1px solid #fecaca", borderRadius:6, padding:"10px 14px", marginBottom:16, color:"#dc2626", fontSize:13 },
  toast:     { position:"fixed", bottom:28, right:28, padding:"12px 18px", borderRadius:8, fontSize:13, fontWeight:600, border:"1px solid", zIndex:999 },
  toastOk:   { background:"#f0fdf4", borderColor:"#bbf7d0", color:"#16a34a" },
  toastWarn: { background:"#fef2f2", borderColor:"#fecaca", color:"#dc2626" },
  btnPurple: { display:"inline-flex", alignItems:"center", gap:6, background:"#8b5cf6", color:"#fff", border:"none", borderRadius:7, padding:"9px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:#f0f4f8; }
  ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
  .inp { width:100%; background:#ffffff; border:1px solid #e2e8f0; color:#1e293b; border-radius:7px; padding:9px 12px; font-size:13px; font-family:inherit; outline:none; transition:border .15s; }
  .inp:focus { border-color:#0ea5e9; box-shadow:0 0 0 2px #0ea5e918; }
  .inp::placeholder { color:#cbd5e1; }
  .sel { cursor:pointer; }
  select option { background:#ffffff; color:#1e293b; }
  .th { padding:11px 16px; text-align:left; font-size:11px; font-weight:600; letter-spacing:.9px; text-transform:uppercase; color:#94a3b8; background:#f8fafc; cursor:pointer; white-space:nowrap; user-select:none; border-bottom:1px solid #e2e8f0; }
  .th:hover { color:#475569; }
  .td { padding:13px 16px; font-size:13px; color:#334155; border-bottom:1px solid #f1f5f9; vertical-align:middle; white-space:nowrap; }
  .row:last-child .td { border-bottom:none; }
  .row:hover .td { background:#f8fafc; }
  .mono { font-family:ui-monospace,'Cascadia Code',monospace; font-size:12px; font-weight:600; }
  .sky { color:#0284c7; }
  .muted { color:#94a3b8; }
  .sm { font-size:12px; }
  .wexp { font-size:12px; color:#dc2626; }
  .woon { font-size:12px; color:#d97706; }
  .wnorm { font-size:12px; color:#94a3b8; }
  .btn-pri { display:inline-flex; align-items:center; gap:6px; background:#0ea5e9; color:#fff; border:none; border-radius:7px; padding:9px 16px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:background .15s; }
  .btn-pri:hover { background:#0284c7; }
  .btn-sec { display:inline-flex; align-items:center; gap:6px; background:#ffffff; color:#64748b; border:1px solid #e2e8f0; border-radius:7px; padding:9px 16px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; }
  .btn-sec:hover { border-color:#94a3b8; color:#1e293b; }
  .btn-del { background:#dc2626; color:#fff; border:none; border-radius:7px; padding:9px 16px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; }
  .btn-del:hover { background:#b91c1c; }
  .ico { background:none; border:none; cursor:pointer; padding:5px 7px; border-radius:5px; font-size:14px; color:#94a3b8; transition:all .15s; }
  .ico:hover { background:#f1f5f9; color:#334155; }
  .ico.danger:hover { background:#fef2f2; }
  .overlay { position:fixed; inset:0; background:rgba(15,23,42,.5); z-index:100; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px); }
  .tab { background:transparent; border:none; border-radius:7px; padding:8px 16px; font-size:13px; font-weight:600; color:#64748b; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; }
  .tab:hover { color:#1e293b; }
  .tab-active { background:#ffffff; color:#0f172a; box-shadow:0 1px 3px rgba(0,0,0,.1); }
`;
