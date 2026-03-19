import { useState, useMemo, useEffect, useRef } from "react";

// ─── GOOGLE SHEETS CONFIG ─────────────────────────────────────────────────────
// Paste your Apps Script Web App URL below after deploying (see google-apps-script.js)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbx4Lq_sR4TDzO8mEYaA0L6bXqUkRXW8MsirkXSU8oiyrONxqb9xklE4VVZqjgyqmv9fhw/exec";

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

// ─── MOBILE PHONES ────────────────────────────────────────────────────────────
const MOB_SAMPLE = [
  { id:"MOB-0001", userName:"Ravi Kumar",   mobileImei:"354678901234567", mobileNo:"9876543210", modelName:"Samsung Galaxy S23", invoiceNo:"INV-MOB-001", location:"Bangalore HQ" },
  { id:"MOB-0002", userName:"Meena Sharma", mobileImei:"354678901234568", mobileNo:"9876543211", modelName:"iPhone 14",          invoiceNo:"INV-MOB-002", location:"Hyderabad"    },
  { id:"MOB-0003", userName:"Arjun Nair",   mobileImei:"354678901234569", mobileNo:"9876543212", modelName:"Redmi Note 12",      invoiceNo:"INV-MOB-003", location:"Chennai"       },
];

const MOB_BLANK = { userName:"", mobileImei:"", mobileNo:"", modelName:"", invoiceNo:"", location:"" };
let _mobCounter = 4;
const genMobId = () => `MOB-${String(_mobCounter++).padStart(4,"0")}`;

const MOB_COLS = [
  { key:"id",         label:"ID" },
  { key:"userName",   label:"User Name" },
  { key:"mobileImei", label:"IMEI Number" },
  { key:"mobileNo",   label:"Mobile No" },
  { key:"modelName",  label:"Model Name" },
  { key:"invoiceNo",  label:"Invoice No" },
  { key:"location",   label:"Location" },
];

// ─── PRINTERS ─────────────────────────────────────────────────────────────────
const PRN_SAMPLE = [
  { id:"PRN-0001", outletName:"Bangalore HQ",    serialNumber:"HP-SN-001", modelName:"HP LaserJet Pro M404n" },
  { id:"PRN-0002", outletName:"Hyderabad Branch", serialNumber:"EPS-SN-002", modelName:"Epson L3150"           },
  { id:"PRN-0003", outletName:"Chennai Outlet",   serialNumber:"CAN-SN-003", modelName:"Canon PIXMA G3010"     },
];

const PRN_BLANK = { outletName:"", serialNumber:"", modelName:"" };
let _prnCounter = 4;
const genPrnId = () => `PRN-${String(_prnCounter++).padStart(4,"0")}`;

const PRN_COLS = [
  { key:"id",           label:"ID" },
  { key:"outletName",   label:"Outlet Name" },
  { key:"serialNumber", label:"Serial Number" },
  { key:"modelName",    label:"Model Name" },
];

// ─── FIXED ASSETS ─────────────────────────────────────────────────────────────
const FA_SAMPLE = [
  { id:"FA-0001", storeName:"Bangalore HQ",    assetCode:"KFJ-FA-001", serialNo:"FA-SN-001", brandName:"Godrej",  assetDetails:"Steel Almirah 4-door",    qty:"2" },
  { id:"FA-0002", storeName:"Hyderabad Branch", assetCode:"KFJ-FA-002", serialNo:"FA-SN-002", brandName:"Wipro",   assetDetails:"Office Chair Ergonomic",   qty:"10" },
  { id:"FA-0003", storeName:"Chennai Outlet",   assetCode:"KFJ-FA-003", serialNo:"FA-SN-003", brandName:"Carrier", assetDetails:"Split AC 1.5 Ton 5 Star",  qty:"3" },
];

const FA_BLANK = { storeName:"", assetCode:"", serialNo:"", brandName:"", assetDetails:"", qty:"" };
let _faCounter = 4;
const genFaId = () => `FA-${String(_faCounter++).padStart(4,"0")}`;

const FA_COLS = [
  { key:"id",           label:"ID" },
  { key:"storeName",    label:"Store Name" },
  { key:"assetCode",    label:"Asset Code" },
  { key:"serialNo",     label:"Serial No" },
  { key:"brandName",    label:"Brand Name" },
  { key:"assetDetails", label:"Asset Details" },
  { key:"qty",          label:"Qty" },
];

// ─── CREDENTIALS ──────────────────────────────────────────────────────────────
const VALID_USER = "Yallappa";
const VALID_PASS = "Audit@1989";

// ─── HELPERS (module-level) ───────────────────────────────────────────────────
const lsGet = (key, fallback) => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; } };
const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
const syncCounter = (data, prefix, ref) => { data.forEach(a => { const n = parseInt((a.id||"").replace(prefix+"-",""))||0; if(n >= ref.val) ref.val = n+1; }); };

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn]   = useState(() => sessionStorage.getItem("auth") === "1");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr,  setLoginErr]  = useState("");
  const [showPass,  setShowPass]  = useState(false);

  const handleLogin = () => {
    if (loginUser === VALID_USER && loginPass === VALID_PASS) {
      sessionStorage.setItem("auth", "1");
      setLoggedIn(true);
    } else {
      setLoginErr("Invalid User ID or Password.");
    }
  };

  const [activeTab, setActiveTab] = useState("it");

  // ── IT state ──
  const [assets, setAssets]             = useState(() => { const d = lsGet("it_assets", IT_SAMPLE); syncCounter(d, "AST", {get val(){return _itCounter}, set val(v){_itCounter=v;}}); return d; });
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
  const [studio, setStudio]             = useState(() => { const d = lsGet("st_items", ST_SAMPLE); syncCounter(d, "STD", {get val(){return _stCounter}, set val(v){_stCounter=v;}}); return d; });
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

  // ── Mobile Phones state ──
  const [mobiles, setMobiles]             = useState(() => { const d = lsGet("mob_items", MOB_SAMPLE); syncCounter(d, "MOB", {get val(){return _mobCounter}, set val(v){_mobCounter=v;}}); return d; });
  const [mobSearch, setMobSearch]         = useState("");
  const [mobSort, setMobSort]             = useState({ col:"id", dir:"asc" });
  const [mobModal, setMobModal]           = useState(null);
  const [mobForm, setMobForm]             = useState(MOB_BLANK);
  const [mobErr, setMobErr]               = useState("");
  const [mobDel, setMobDel]               = useState(null);
  const [mobUpload, setMobUpload]         = useState(false);
  const [mobCsvPreview, setMobCsvPreview] = useState([]);
  const [mobCsvRaw, setMobCsvRaw]         = useState("");

  // ── Printers state ──
  const [printers, setPrinters]             = useState(() => { const d = lsGet("prn_items", PRN_SAMPLE); syncCounter(d, "PRN", {get val(){return _prnCounter}, set val(v){_prnCounter=v;}}); return d; });
  const [prnSearch, setPrnSearch]           = useState("");
  const [prnSort, setPrnSort]               = useState({ col:"id", dir:"asc" });
  const [prnModal, setPrnModal]             = useState(null);
  const [prnForm, setPrnForm]               = useState(PRN_BLANK);
  const [prnErr, setPrnErr]                 = useState("");
  const [prnDel, setPrnDel]                 = useState(null);
  const [prnUpload, setPrnUpload]           = useState(false);
  const [prnCsvPreview, setPrnCsvPreview]   = useState([]);
  const [prnCsvRaw, setPrnCsvRaw]           = useState("");

  // ── Fixed Assets state ──
  const [fixedAssets, setFixedAssets]         = useState(() => { const d = lsGet("fa_items", FA_SAMPLE); syncCounter(d, "FA", {get val(){return _faCounter}, set val(v){_faCounter=v;}}); return d; });
  const [faSearch, setFaSearch]               = useState("");
  const [faSort, setFaSort]                   = useState({ col:"id", dir:"asc" });
  const [faModal, setFaModal]                 = useState(null);
  const [faForm, setFaForm]                   = useState(FA_BLANK);
  const [faErr, setFaErr]                     = useState("");
  const [faDel, setFaDel]                     = useState(null);
  const [faUpload, setFaUpload]               = useState(false);
  const [faCsvPreview, setFaCsvPreview]       = useState([]);
  const [faCsvRaw, setFaCsvRaw]               = useState("");

  const [toast, setToast]   = useState(null);
  const [syncing, setSyncing] = useState(false);
  const initialized = useRef(false);

  // ── Google Sheets sync ──
  const saveSheet = (type, data) => {
    if (!SHEET_URL) return;
    fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type, data }),
    }).catch(() => {});
  };

  // Load from Google Sheets on first mount; fall back to localStorage
  useEffect(() => {
    if (!SHEET_URL) { initialized.current = true; return; }
    setSyncing(true);
    fetch(SHEET_URL)
      .then(r => r.json())
      .then(d => {
        if (d.it && d.it.length)                   { setAssets(d.it);           lsSet("it_assets", d.it); }
        if (d.studio && d.studio.length)           { setStudio(d.studio);       lsSet("st_items", d.studio); }
        if (d.mobile && d.mobile.length)           { setMobiles(d.mobile);      lsSet("mob_items", d.mobile); }
        if (d.printer && d.printer.length)         { setPrinters(d.printer);    lsSet("prn_items", d.printer); }
        if (d.fixedasset && d.fixedasset.length)   { setFixedAssets(d.fixedasset); lsSet("fa_items", d.fixedasset); }
      })
      .catch(() => {})
      .finally(() => { setSyncing(false); initialized.current = true; });
  // eslint-disable-next-line
  }, []);

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
    let next;
    if (itModal.mode==="add") { next = [...assets, {...itForm, id:genItId()}]; showToast("Asset added."); }
    else { next = assets.map(a => a.id===itModal.asset.id ? {...itForm,id:a.id} : a); showToast("Asset updated."); }
    setAssets(next); lsSet("it_assets", next); saveSheet("it", next);
    setItModal(null);
  };
  const deleteIt = () => {
    const next = assets.filter(a=>a.id!==itDel.id);
    setAssets(next); lsSet("it_assets", next); saveSheet("it", next);
    showToast("Asset deleted.","warn"); setItDel(null); if(itModal) setItModal(null);
  };

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
    const next = items;
    setAssets(next); lsSet("it_assets", next); saveSheet("it", next);
    showToast(`${items.length} assets uploaded! Previous data replaced.`); setItUpload(false); setItCsvPreview([]); setItCsvRaw("");
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
    let next;
    if (stModal.mode==="add") { next = [...studio, {...stForm, id:genStId()}]; showToast("Item added."); }
    else { next = studio.map(a => a.id===stModal.asset.id ? {...stForm,id:a.id} : a); showToast("Item updated."); }
    setStudio(next); lsSet("st_items", next); saveSheet("studio", next);
    setStModal(null);
  };
  const deleteSt = () => {
    const next = studio.filter(a=>a.id!==stDel.id);
    setStudio(next); lsSet("st_items", next); saveSheet("studio", next);
    showToast("Item deleted.","warn"); setStDel(null); if(stModal) setStModal(null);
  };

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
    const next = items;
    setStudio(next); lsSet("st_items", next); saveSheet("studio", next);
    showToast(`${items.length} items uploaded! Previous data replaced.`); setStUpload(false); setStCsvPreview([]); setStCsvRaw("");
  };

  const fs = (k,v) => setStForm(p=>({...p,[k]:v}));

  // ── Mobile Phones logic ──
  const mobFiltered = useMemo(() => {
    const q = mobSearch.toLowerCase();
    return [...mobiles]
      .filter(a => !q || [a.id,a.userName,a.mobileImei,a.mobileNo,a.modelName,a.invoiceNo,a.location].join(" ").toLowerCase().includes(q))
      .sort((a,b) => { const va=a[mobSort.col]||"",vb=b[mobSort.col]||""; return mobSort.dir==="asc"?va.localeCompare(vb):vb.localeCompare(va); });
  }, [mobiles, mobSearch, mobSort]);

  const mobCounts = useMemo(() => ({
    total:     mobiles.length,
    locations: new Set(mobiles.map(a=>a.location).filter(Boolean)).size,
  }), [mobiles]);

  const saveMob = () => {
    if (!mobForm.userName.trim())   return setMobErr("User name is required.");
    if (!mobForm.mobileImei.trim()) return setMobErr("IMEI number is required.");
    let next;
    if (mobModal.mode==="add") { next = [...mobiles, {...mobForm, id:genMobId()}]; showToast("Mobile added."); }
    else { next = mobiles.map(a => a.id===mobModal.asset.id ? {...mobForm,id:a.id} : a); showToast("Mobile updated."); }
    setMobiles(next); lsSet("mob_items", next); saveSheet("mobile", next);
    setMobModal(null);
  };
  const deleteMob = () => {
    const next = mobiles.filter(a=>a.id!==mobDel.id);
    setMobiles(next); lsSet("mob_items", next); saveSheet("mobile", next);
    showToast("Mobile deleted.","warn"); setMobDel(null); if(mobModal) setMobModal(null);
  };

  const exportMobCSV = () => {
    const keys = ["id","userName","mobileImei","mobileNo","modelName","invoiceNo","location"];
    const rows = [keys.join(","), ...mobFiltered.map(a=>keys.map(k=>`"${(a[k]||"").replace(/"/g,'""')}"`).join(","))];
    dl(rows.join("\n"), "mobile-phones.csv");
  };

  const handleMobUpload = e => {
    const file = e.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = ev => {
      const text = ev.target.result; setMobCsvRaw(text);
      const lines = text.trim().split("\n");
      const hdr = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
      setMobCsvPreview(lines.slice(1,6).map(line=>{ const v=line.split(",").map(x=>x.replace(/"/g,"").trim()); const o={}; hdr.forEach((h,i)=>o[h]=v[i]||""); return o; }));
      setMobUpload(true);
    };
    r.readAsText(file);
  };

  const confirmMobUpload = () => {
    const lines = mobCsvRaw.trim().split("\n");
    const hdr = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
    const MAP = { "User Name":"userName","IMEI Number":"mobileImei","Mobile No":"mobileNo","Model Name":"modelName","Invoice No":"invoiceNo","Location":"location" };
    const items = lines.slice(1).map(line=>{ const v=line.split(",").map(x=>x.replace(/"/g,"").trim()); const o={id:genMobId()}; hdr.forEach((h,i)=>{ o[MAP[h]||h]=v[i]||""; }); return o; });
    const next = items;
    setMobiles(next); lsSet("mob_items", next); saveSheet("mobile", next);
    showToast(`${items.length} mobiles uploaded!`); setMobUpload(false); setMobCsvPreview([]); setMobCsvRaw("");
  };

  const fm = (k,v) => setMobForm(p=>({...p,[k]:v}));

  // ── Printers logic ──
  const prnFiltered = useMemo(() => {
    const q = prnSearch.toLowerCase();
    return [...printers]
      .filter(a => !q || [a.id,a.outletName,a.serialNumber,a.modelName].join(" ").toLowerCase().includes(q))
      .sort((a,b) => { const va=a[prnSort.col]||"",vb=b[prnSort.col]||""; return prnSort.dir==="asc"?va.localeCompare(vb):vb.localeCompare(va); });
  }, [printers, prnSearch, prnSort]);

  const prnCounts = useMemo(() => ({
    total:   printers.length,
    outlets: new Set(printers.map(a=>a.outletName).filter(Boolean)).size,
  }), [printers]);

  const savePrn = () => {
    if (!prnForm.outletName.trim())   return setPrnErr("Outlet name is required.");
    if (!prnForm.serialNumber.trim()) return setPrnErr("Serial number is required.");
    let next;
    if (prnModal.mode==="add") { next = [...printers, {...prnForm, id:genPrnId()}]; showToast("Printer added."); }
    else { next = printers.map(a => a.id===prnModal.asset.id ? {...prnForm,id:a.id} : a); showToast("Printer updated."); }
    setPrinters(next); lsSet("prn_items", next); saveSheet("printer", next);
    setPrnModal(null);
  };
  const deletePrn = () => {
    const next = printers.filter(a=>a.id!==prnDel.id);
    setPrinters(next); lsSet("prn_items", next); saveSheet("printer", next);
    showToast("Printer deleted.","warn"); setPrnDel(null); if(prnModal) setPrnModal(null);
  };

  const exportPrnCSV = () => {
    const keys = ["id","outletName","serialNumber","modelName"];
    const rows = [keys.join(","), ...prnFiltered.map(a=>keys.map(k=>`"${(a[k]||"").replace(/"/g,'""')}"`).join(","))];
    dl(rows.join("\n"), "printers.csv");
  };

  const handlePrnUpload = e => {
    const file = e.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = ev => {
      const text = ev.target.result; setPrnCsvRaw(text);
      const lines = text.trim().split("\n");
      const hdr = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
      setPrnCsvPreview(lines.slice(1,6).map(line=>{ const v=line.split(",").map(x=>x.replace(/"/g,"").trim()); const o={}; hdr.forEach((h,i)=>o[h]=v[i]||""); return o; }));
      setPrnUpload(true);
    };
    r.readAsText(file);
  };

  const confirmPrnUpload = () => {
    const lines = prnCsvRaw.trim().split("\n");
    const hdr = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
    const MAP = { "Outlet Name":"outletName","Serial Number":"serialNumber","Model Name":"modelName" };
    const items = lines.slice(1).map(line=>{ const v=line.split(",").map(x=>x.replace(/"/g,"").trim()); const o={id:genPrnId()}; hdr.forEach((h,i)=>{ o[MAP[h]||h]=v[i]||""; }); return o; });
    const next = items;
    setPrinters(next); lsSet("prn_items", next); saveSheet("printer", next);
    showToast(`${items.length} printers uploaded!`); setPrnUpload(false); setPrnCsvPreview([]); setPrnCsvRaw("");
  };

  const fp = (k,v) => setPrnForm(p=>({...p,[k]:v}));

  // ── Fixed Assets logic ──
  const faFiltered = useMemo(() => {
    const q = faSearch.toLowerCase();
    return [...fixedAssets]
      .filter(a => !q || [a.id,a.storeName,a.assetCode,a.serialNo,a.brandName,a.assetDetails].join(" ").toLowerCase().includes(q))
      .sort((a,b) => { const va=a[faSort.col]||"",vb=b[faSort.col]||""; return faSort.dir==="asc"?va.localeCompare(vb):vb.localeCompare(va); });
  }, [fixedAssets, faSearch, faSort]);

  const faCounts = useMemo(() => ({
    total:    fixedAssets.length,
    totalQty: fixedAssets.reduce((s,a)=>s+(parseFloat((a.qty||"").toString().replace(/,/g,""))||0), 0),
  }), [fixedAssets]);

  const saveFa = () => {
    if (!faForm.storeName.trim()) return setFaErr("Store name is required.");
    if (!faForm.assetCode.trim()) return setFaErr("Asset code is required.");
    let next;
    if (faModal.mode==="add") { next = [...fixedAssets, {...faForm, id:genFaId()}]; showToast("Fixed asset added."); }
    else { next = fixedAssets.map(a => a.id===faModal.asset.id ? {...faForm,id:a.id} : a); showToast("Fixed asset updated."); }
    setFixedAssets(next); lsSet("fa_items", next); saveSheet("fixedasset", next);
    setFaModal(null);
  };
  const deleteFa = () => {
    const next = fixedAssets.filter(a=>a.id!==faDel.id);
    setFixedAssets(next); lsSet("fa_items", next); saveSheet("fixedasset", next);
    showToast("Fixed asset deleted.","warn"); setFaDel(null); if(faModal) setFaModal(null);
  };

  const exportFaCSV = () => {
    const keys = ["id","storeName","assetCode","serialNo","brandName","assetDetails","qty"];
    const rows = [keys.join(","), ...faFiltered.map(a=>keys.map(k=>`"${(a[k]||"").replace(/"/g,'""')}"`).join(","))];
    dl(rows.join("\n"), "fixed-assets.csv");
  };

  const handleFaUpload = e => {
    const file = e.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = ev => {
      const text = ev.target.result; setFaCsvRaw(text);
      const lines = text.trim().split("\n");
      const hdr = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
      setFaCsvPreview(lines.slice(1,6).map(line=>{ const v=line.split(",").map(x=>x.replace(/"/g,"").trim()); const o={}; hdr.forEach((h,i)=>o[h]=v[i]||""); return o; }));
      setFaUpload(true);
    };
    r.readAsText(file);
  };

  const confirmFaUpload = () => {
    const lines = faCsvRaw.trim().split("\n");
    const hdr = lines[0].split(",").map(h=>h.replace(/"/g,"").trim());
    const MAP = { "store name":"storeName","asset code":"assetCode","serial no":"serialNo","serial number":"serialNo","brand name":"brandName","asset details":"assetDetails","qty":"qty","quantity":"qty" };
    const items = lines.slice(1).map(line=>{ const v=line.split(",").map(x=>x.replace(/"/g,"").trim()); const o={id:genFaId()}; hdr.forEach((h,i)=>{ o[MAP[h.toLowerCase()]||h]=v[i]||""; }); return o; });
    const next = items;
    setFixedAssets(next); lsSet("fa_items", next); saveSheet("fixedasset", next);
    showToast(`${items.length} fixed assets uploaded!`); setFaUpload(false); setFaCsvPreview([]); setFaCsvRaw("");
  };

  const ff = (k,v) => setFaForm(p=>({...p,[k]:v}));

  if (!loggedIn) return (
    <div style={{ minHeight:"100vh", background:"#f0f4f8", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 4px 32px #0001", padding:"48px 40px", width:360, textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🖥️</div>
        <div style={{ fontWeight:800, fontSize:22, color:"#1e293b", marginBottom:4 }}>IT Asset Tracker</div>
        <div style={{ color:"#64748b", fontSize:13, marginBottom:28 }}>Kushals Retail · IT Asset Registry</div>
        <div style={{ textAlign:"left", marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#475569", display:"block", marginBottom:4 }}>USER ID</label>
          <input value={loginUser} onChange={e => { setLoginUser(e.target.value); setLoginErr(""); }} onKeyDown={e => e.key==="Enter" && handleLogin()} placeholder="Enter User ID"
            style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:14, outline:"none", boxSizing:"border-box" }} />
        </div>
        <div style={{ textAlign:"left", marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#475569", display:"block", marginBottom:4 }}>PASSWORD</label>
          <div style={{ position:"relative" }}>
            <input type={showPass ? "text" : "password"} value={loginPass} onChange={e => { setLoginPass(e.target.value); setLoginErr(""); }} onKeyDown={e => e.key==="Enter" && handleLogin()} placeholder="Enter Password"
              style={{ width:"100%", padding:"10px 36px 10px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            <span onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", cursor:"pointer", fontSize:16, color:"#94a3b8" }}>
              {showPass ? "🙈" : "👁️"}
            </span>
          </div>
        </div>
        {loginErr && <div style={{ color:"#dc2626", fontSize:13, marginBottom:14, background:"#fef2f2", padding:"8px 12px", borderRadius:8 }}>{loginErr}</div>}
        <button onClick={handleLogin} style={{ width:"100%", padding:"12px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:700, cursor:"pointer" }}>
          Login
        </button>
      </div>
    </div>
  );

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
              <div style={S.brandSub}>
                Asset & Inventory Registry
                {syncing && <span style={{ marginLeft:8, color:"#0ea5e9", fontSize:10, fontWeight:600 }}>⟳ Syncing…</span>}
                {!syncing && SHEET_URL && <span style={{ marginLeft:8, color:"#16a34a", fontSize:10, fontWeight:600 }}>● Sheets connected</span>}
                {!SHEET_URL && <span style={{ marginLeft:8, color:"#f59e0b", fontSize:10, fontWeight:600 }}>⚠ Add SHEET_URL to sync</span>}
              </div>
            </div>
          </div>

          <div style={S.tabs}>
            <button className={activeTab==="it"?"tab tab-active":"tab"} onClick={()=>setActiveTab("it")}>💻 IT Assets</button>
            <button className={activeTab==="studio"?"tab tab-active":"tab"} onClick={()=>setActiveTab("studio")}>🎬 Studio Inventory</button>
            <button className={activeTab==="mobile"?"tab tab-active":"tab"} onClick={()=>setActiveTab("mobile")}>📱 Mobile Phones</button>
            <button className={activeTab==="printers"?"tab tab-active":"tab"} onClick={()=>setActiveTab("printers")}>🖨️ Printers</button>
            <button className={activeTab==="fixedassets"?"tab tab-active":"tab"} onClick={()=>setActiveTab("fixedassets")}>🏢 Fixed Assets</button>
          </div>

          {activeTab==="it" && (
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <label className="btn-sec" style={{ cursor:"pointer" }}>⬆ Upload CSV<input type="file" accept=".csv" style={{ display:"none" }} onChange={handleItUpload}/></label>
              <button className="btn-sec" onClick={exportItCSV}>⬇ Export CSV</button>
              <button className="btn-pri" onClick={()=>{ setItForm(IT_BLANK); setItErr(""); setItModal({mode:"add"}); }}>+ Add Asset</button>
            </div>
          )}
          {activeTab==="studio" && (
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <label className="btn-sec" style={{ cursor:"pointer" }}>⬆ Upload CSV<input type="file" accept=".csv" style={{ display:"none" }} onChange={handleStUpload}/></label>
              <button className="btn-sec" onClick={exportStCSV}>⬇ Export CSV</button>
              <button style={S.btnPurple} onClick={()=>{ setStForm(ST_BLANK); setStErr(""); setStModal({mode:"add"}); }}>+ Add Item</button>
            </div>
          )}
          {activeTab==="mobile" && (
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <label className="btn-sec" style={{ cursor:"pointer" }}>⬆ Upload CSV<input type="file" accept=".csv" style={{ display:"none" }} onChange={handleMobUpload}/></label>
              <button className="btn-sec" onClick={exportMobCSV}>⬇ Export CSV</button>
              <button style={S.btnGreen} onClick={()=>{ setMobForm(MOB_BLANK); setMobErr(""); setMobModal({mode:"add"}); }}>+ Add Mobile</button>
            </div>
          )}
          {activeTab==="printers" && (
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <label className="btn-sec" style={{ cursor:"pointer" }}>⬆ Upload CSV<input type="file" accept=".csv" style={{ display:"none" }} onChange={handlePrnUpload}/></label>
              <button className="btn-sec" onClick={exportPrnCSV}>⬇ Export CSV</button>
              <button style={S.btnOrange} onClick={()=>{ setPrnForm(PRN_BLANK); setPrnErr(""); setPrnModal({mode:"add"}); }}>+ Add Printer</button>
            </div>
          )}
          {activeTab==="fixedassets" && (
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <label className="btn-sec" style={{ cursor:"pointer" }}>⬆ Upload CSV<input type="file" accept=".csv" style={{ display:"none" }} onChange={handleFaUpload}/></label>
              <button className="btn-sec" onClick={exportFaCSV}>⬇ Export CSV</button>
              <button style={S.btnTeal} onClick={()=>{ setFaForm(FA_BLANK); setFaErr(""); setFaModal({mode:"add"}); }}>+ Add Fixed Asset</button>
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

      {/* ══════════════ MOBILE PHONES TAB ══════════════ */}
      {activeTab==="mobile" && (
        <main style={S.main}>
          <div style={{ ...S.cards, gridTemplateColumns:"repeat(2,1fr)" }}>
            {[
              { label:"Total Mobiles", val:mobCounts.total,     accent:"#22c55e" },
              { label:"Locations",     val:mobCounts.locations, accent:"#0ea5e9" },
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
              <input className="inp" style={{ paddingLeft:36 }} placeholder="Search by user, IMEI, mobile no, model, location…" value={mobSearch} onChange={e=>setMobSearch(e.target.value)}/>
            </div>
            <span style={S.count}>{mobFiltered.length} / {mobiles.length}</span>
          </div>

          <div style={S.tableWrap}>
            <div style={{ overflowX:"auto" }}>
              <table style={S.table}>
                <thead><tr>
                  {MOB_COLS.map(c=>(
                    <th key={c.key} className="th" onClick={()=>setMobSort(s=>({col:c.key,dir:s.col===c.key&&s.dir==="asc"?"desc":"asc"}))}>
                      {c.label}<SortArrow active={mobSort.col===c.key} dir={mobSort.dir}/>
                    </th>
                  ))}
                  <th className="th" style={{ textAlign:"right" }}>Actions</th>
                </tr></thead>
                <tbody>
                  {mobFiltered.length===0
                    ? <tr><td colSpan={MOB_COLS.length+1} style={{ padding:"60px 0",textAlign:"center",color:"#94a3b8",fontSize:14 }}>No mobile phones match your filters.</td></tr>
                    : mobFiltered.map(a=>(
                      <tr key={a.id} className="row">
                        <td className="td mono" style={{ color:"#22c55e" }}>{a.id}</td>
                        <td className="td"><strong style={{ color:"#0f172a" }}>{a.userName||<Dash/>}</strong></td>
                        <td className="td mono sm" style={{ color:"#64748b" }}>{a.mobileImei||<Dash/>}</td>
                        <td className="td muted">{a.mobileNo||<Dash/>}</td>
                        <td className="td muted">{a.modelName||<Dash/>}</td>
                        <td className="td mono sm" style={{ color:"#a78bfa" }}>{a.invoiceNo||<Dash/>}</td>
                        <td className="td muted sm">{a.location||<Dash/>}</td>
                        <td className="td" style={{ textAlign:"right" }}>
                          <button className="ico" title="Edit" onClick={()=>{ setMobForm({...a}); setMobErr(""); setMobModal({mode:"edit",asset:a}); }}>✏️</button>
                          <button className="ico danger" title="Delete" onClick={()=>setMobDel(a)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* ══════════════ PRINTERS TAB ══════════════ */}
      {activeTab==="printers" && (
        <main style={S.main}>
          <div style={{ ...S.cards, gridTemplateColumns:"repeat(2,1fr)" }}>
            {[
              { label:"Total Printers", val:prnCounts.total,   accent:"#f59e0b" },
              { label:"Outlets",        val:prnCounts.outlets, accent:"#0ea5e9" },
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
              <input className="inp" style={{ paddingLeft:36 }} placeholder="Search by outlet, serial number, model…" value={prnSearch} onChange={e=>setPrnSearch(e.target.value)}/>
            </div>
            <span style={S.count}>{prnFiltered.length} / {printers.length}</span>
          </div>

          <div style={S.tableWrap}>
            <div style={{ overflowX:"auto" }}>
              <table style={S.table}>
                <thead><tr>
                  {PRN_COLS.map(c=>(
                    <th key={c.key} className="th" onClick={()=>setPrnSort(s=>({col:c.key,dir:s.col===c.key&&s.dir==="asc"?"desc":"asc"}))}>
                      {c.label}<SortArrow active={prnSort.col===c.key} dir={prnSort.dir}/>
                    </th>
                  ))}
                  <th className="th" style={{ textAlign:"right" }}>Actions</th>
                </tr></thead>
                <tbody>
                  {prnFiltered.length===0
                    ? <tr><td colSpan={PRN_COLS.length+1} style={{ padding:"60px 0",textAlign:"center",color:"#94a3b8",fontSize:14 }}>No printers match your filters.</td></tr>
                    : prnFiltered.map(a=>(
                      <tr key={a.id} className="row">
                        <td className="td mono" style={{ color:"#f59e0b" }}>{a.id}</td>
                        <td className="td"><strong style={{ color:"#0f172a" }}>{a.outletName||<Dash/>}</strong></td>
                        <td className="td mono sm" style={{ color:"#64748b" }}>{a.serialNumber||<Dash/>}</td>
                        <td className="td muted">{a.modelName||<Dash/>}</td>
                        <td className="td" style={{ textAlign:"right" }}>
                          <button className="ico" title="Edit" onClick={()=>{ setPrnForm({...a}); setPrnErr(""); setPrnModal({mode:"edit",asset:a}); }}>✏️</button>
                          <button className="ico danger" title="Delete" onClick={()=>setPrnDel(a)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* ══════════════ FIXED ASSETS TAB ══════════════ */}
      {activeTab==="fixedassets" && (
        <main style={S.main}>
          <div style={{ ...S.cards, gridTemplateColumns:"repeat(2,1fr)" }}>
            {[
              { label:"Total Records", val:faCounts.total,                                 accent:"#14b8a6" },
              { label:"Total Qty",     val:faCounts.totalQty.toLocaleString("en-IN"),      accent:"#8b5cf6" },
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
              <input className="inp" style={{ paddingLeft:36 }} placeholder="Search by store, asset code, serial, brand, details…" value={faSearch} onChange={e=>setFaSearch(e.target.value)}/>
            </div>
            <span style={S.count}>{faFiltered.length} / {fixedAssets.length}</span>
          </div>

          <div style={S.tableWrap}>
            <div style={{ overflowX:"auto" }}>
              <table style={S.table}>
                <thead><tr>
                  {FA_COLS.map(c=>(
                    <th key={c.key} className="th" onClick={()=>setFaSort(s=>({col:c.key,dir:s.col===c.key&&s.dir==="asc"?"desc":"asc"}))}>
                      {c.label}<SortArrow active={faSort.col===c.key} dir={faSort.dir}/>
                    </th>
                  ))}
                  <th className="th" style={{ textAlign:"right" }}>Actions</th>
                </tr></thead>
                <tbody>
                  {faFiltered.length===0
                    ? <tr><td colSpan={FA_COLS.length+1} style={{ padding:"60px 0",textAlign:"center",color:"#94a3b8",fontSize:14 }}>No fixed assets match your filters.</td></tr>
                    : faFiltered.map(a=>(
                      <tr key={a.id} className="row">
                        <td className="td mono" style={{ color:"#14b8a6" }}>{a.id}</td>
                        <td className="td"><strong style={{ color:"#0f172a" }}>{a.storeName||<Dash/>}</strong></td>
                        <td className="td mono sm" style={{ color:"#a78bfa" }}>{a.assetCode||<Dash/>}</td>
                        <td className="td mono sm" style={{ color:"#64748b" }}>{a.serialNo||<Dash/>}</td>
                        <td className="td muted">{a.brandName||<Dash/>}</td>
                        <td className="td muted">{a.assetDetails||<Dash/>}</td>
                        <td className="td" style={{ textAlign:"right", color:"#334155", fontWeight:600 }}>{a.qty||<Dash/>}</td>
                        <td className="td" style={{ textAlign:"right" }}>
                          <button className="ico" title="Edit" onClick={()=>{ setFaForm({...a}); setFaErr(""); setFaModal({mode:"edit",asset:a}); }}>✏️</button>
                          <button className="ico danger" title="Delete" onClick={()=>setFaDel(a)}>🗑</button>
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

      {/* ══ Mobile Phones Add/Edit Modal ══ */}
      {mobModal && (
        <div className="overlay" onClick={()=>setMobModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>{mobModal.mode==="add"?"Add Mobile Phone":`Edit — ${mobModal.asset.id}`}</span>
              <button className="ico" onClick={()=>setMobModal(null)} style={{ fontSize:22,lineHeight:1 }}>×</button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              {mobErr && <div style={S.errBox}>{mobErr}</div>}
              <div style={S.grid2}>
                <FField label="User Name *"    val={mobForm.userName}   set={v=>fm("userName",v)}   ph="Employee name"/>
                <FField label="IMEI Number *"  val={mobForm.mobileImei} set={v=>fm("mobileImei",v)} ph="e.g. 354678901234567"/>
                <FField label="Mobile No"      val={mobForm.mobileNo}   set={v=>fm("mobileNo",v)}   ph="e.g. 9876543210"/>
                <FField label="Model Name"     val={mobForm.modelName}  set={v=>fm("modelName",v)}  ph="e.g. Samsung Galaxy S23"/>
                <FField label="Invoice No"     val={mobForm.invoiceNo}  set={v=>fm("invoiceNo",v)}  ph="e.g. INV-MOB-001"/>
                <FField label="Location"       val={mobForm.location}   set={v=>fm("location",v)}   ph="Office / Branch"/>
              </div>
              <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:22 }}>
                <button className="btn-sec" onClick={()=>setMobModal(null)}>Cancel</button>
                <button style={S.btnGreen} onClick={saveMob}>{mobModal.mode==="add"?"Add Mobile":"Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Printers Add/Edit Modal ══ */}
      {prnModal && (
        <div className="overlay" onClick={()=>setPrnModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>{prnModal.mode==="add"?"Add Printer":`Edit — ${prnModal.asset.id}`}</span>
              <button className="ico" onClick={()=>setPrnModal(null)} style={{ fontSize:22,lineHeight:1 }}>×</button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              {prnErr && <div style={S.errBox}>{prnErr}</div>}
              <div style={S.grid2}>
                <FField label="Outlet Name *"    val={prnForm.outletName}   set={v=>fp("outletName",v)}   ph="e.g. Bangalore HQ"/>
                <FField label="Serial Number *"  val={prnForm.serialNumber} set={v=>fp("serialNumber",v)} ph="e.g. HP-SN-001"/>
                <div style={{ gridColumn:"1/-1" }}>
                  <FField label="Model Name"     val={prnForm.modelName}    set={v=>fp("modelName",v)}    ph="e.g. HP LaserJet Pro M404n"/>
                </div>
              </div>
              <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:22 }}>
                <button className="btn-sec" onClick={()=>setPrnModal(null)}>Cancel</button>
                <button style={S.btnOrange} onClick={savePrn}>{prnModal.mode==="add"?"Add Printer":"Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Fixed Assets Add/Edit Modal ══ */}
      {faModal && (
        <div className="overlay" onClick={()=>setFaModal(null)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>{faModal.mode==="add"?"Add Fixed Asset":`Edit — ${faModal.asset.id}`}</span>
              <button className="ico" onClick={()=>setFaModal(null)} style={{ fontSize:22,lineHeight:1 }}>×</button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              {faErr && <div style={S.errBox}>{faErr}</div>}
              <div style={S.grid2}>
                <FField label="Store Name *"   val={faForm.storeName}    set={v=>ff("storeName",v)}    ph="e.g. Bangalore HQ"/>
                <FField label="Asset Code *"   val={faForm.assetCode}    set={v=>ff("assetCode",v)}    ph="e.g. KFJ-FA-001"/>
                <FField label="Serial No"      val={faForm.serialNo}     set={v=>ff("serialNo",v)}     ph="e.g. FA-SN-001"/>
                <FField label="Brand Name"     val={faForm.brandName}    set={v=>ff("brandName",v)}    ph="e.g. Godrej"/>
                <div style={{ gridColumn:"1/-1" }}>
                  <FField label="Asset Details" val={faForm.assetDetails} set={v=>ff("assetDetails",v)} ph="e.g. Steel Almirah 4-door"/>
                </div>
                <FField label="Qty"            val={faForm.qty}          set={v=>ff("qty",v)}          ph="e.g. 2"/>
              </div>
              <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:22 }}>
                <button className="btn-sec" onClick={()=>setFaModal(null)}>Cancel</button>
                <button style={S.btnTeal} onClick={saveFa}>{faModal.mode==="add"?"Add Fixed Asset":"Save Changes"}</button>
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

      {/* ══ Mobile Delete ══ */}
      {mobDel && (
        <div className="overlay" onClick={()=>setMobDel(null)}>
          <div style={{ ...S.modal,maxWidth:400 }} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,color:"#dc2626" }}>Delete Mobile</span>
              <button className="ico" onClick={()=>setMobDel(null)} style={{ fontSize:22 }}>×</button>
            </div>
            <div style={{ padding:"20px 28px" }}>
              <p style={{ fontSize:14,color:"#64748b",lineHeight:1.8,marginBottom:20 }}>
                Permanently delete <strong style={{ color:"#0f172a" }}>{mobDel.modelName||mobDel.userName}</strong> ({mobDel.id})?<br/>This cannot be undone.
              </p>
              <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
                <button className="btn-sec" onClick={()=>setMobDel(null)}>Cancel</button>
                <button className="btn-del" onClick={deleteMob}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Printer Delete ══ */}
      {prnDel && (
        <div className="overlay" onClick={()=>setPrnDel(null)}>
          <div style={{ ...S.modal,maxWidth:400 }} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,color:"#dc2626" }}>Delete Printer</span>
              <button className="ico" onClick={()=>setPrnDel(null)} style={{ fontSize:22 }}>×</button>
            </div>
            <div style={{ padding:"20px 28px" }}>
              <p style={{ fontSize:14,color:"#64748b",lineHeight:1.8,marginBottom:20 }}>
                Permanently delete <strong style={{ color:"#0f172a" }}>{prnDel.modelName||prnDel.outletName}</strong> ({prnDel.id})?<br/>This cannot be undone.
              </p>
              <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
                <button className="btn-sec" onClick={()=>setPrnDel(null)}>Cancel</button>
                <button className="btn-del" onClick={deletePrn}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Fixed Asset Delete ══ */}
      {faDel && (
        <div className="overlay" onClick={()=>setFaDel(null)}>
          <div style={{ ...S.modal,maxWidth:400 }} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,color:"#dc2626" }}>Delete Fixed Asset</span>
              <button className="ico" onClick={()=>setFaDel(null)} style={{ fontSize:22 }}>×</button>
            </div>
            <div style={{ padding:"20px 28px" }}>
              <p style={{ fontSize:14,color:"#64748b",lineHeight:1.8,marginBottom:20 }}>
                Permanently delete <strong style={{ color:"#0f172a" }}>{faDel.assetDetails||faDel.assetCode}</strong> ({faDel.id})?<br/>This cannot be undone.
              </p>
              <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
                <button className="btn-sec" onClick={()=>setFaDel(null)}>Cancel</button>
                <button className="btn-del" onClick={deleteFa}>Delete</button>
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

      {/* ══ Mobile CSV Preview ══ */}
      {mobUpload && (
        <div className="overlay" onClick={()=>setMobUpload(false)}>
          <div style={{ ...S.modal,maxWidth:600 }} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>📂 Mobile Phones — Upload Preview</span>
              <button className="ico" onClick={()=>setMobUpload(false)} style={{ fontSize:22 }}>×</button>
            </div>
            <CsvPreview rows={mobCsvPreview} onCancel={()=>setMobUpload(false)} onConfirm={confirmMobUpload}/>
          </div>
        </div>
      )}

      {/* ══ Printer CSV Preview ══ */}
      {prnUpload && (
        <div className="overlay" onClick={()=>setPrnUpload(false)}>
          <div style={{ ...S.modal,maxWidth:600 }} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>📂 Printers — Upload Preview</span>
              <button className="ico" onClick={()=>setPrnUpload(false)} style={{ fontSize:22 }}>×</button>
            </div>
            <CsvPreview rows={prnCsvPreview} onCancel={()=>setPrnUpload(false)} onConfirm={confirmPrnUpload}/>
          </div>
        </div>
      )}

      {/* ══ Fixed Assets CSV Preview ══ */}
      {faUpload && (
        <div className="overlay" onClick={()=>setFaUpload(false)}>
          <div style={{ ...S.modal,maxWidth:600 }} onClick={e=>e.stopPropagation()}>
            <div style={S.mHead}>
              <span style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>📂 Fixed Assets — Upload Preview</span>
              <button className="ico" onClick={()=>setFaUpload(false)} style={{ fontSize:22 }}>×</button>
            </div>
            <CsvPreview rows={faCsvPreview} onCancel={()=>setFaUpload(false)} onConfirm={confirmFaUpload}/>
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
  btnGreen:  { display:"inline-flex", alignItems:"center", gap:6, background:"#16a34a", color:"#fff", border:"none", borderRadius:7, padding:"9px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  btnOrange: { display:"inline-flex", alignItems:"center", gap:6, background:"#ea580c", color:"#fff", border:"none", borderRadius:7, padding:"9px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  btnTeal:   { display:"inline-flex", alignItems:"center", gap:6, background:"#0d9488", color:"#fff", border:"none", borderRadius:7, padding:"9px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
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
  .tab { background:transparent; border:none; border-radius:7px; padding:6px 12px; font-size:12px; font-weight:600; color:#64748b; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; }
  .tab:hover { color:#1e293b; }
  .tab-active { background:#ffffff; color:#0f172a; box-shadow:0 1px 3px rgba(0,0,0,.1); }
`;
