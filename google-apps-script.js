// ─────────────────────────────────────────────────────────────────────────────
// Kushals Retail — Asset Tracker · Google Apps Script Backend
// Steps:
//   1. Open your Google Sheet → Extensions → Apps Script
//   2. Paste this entire file, replacing any existing code
//   3. Click Deploy → New Deployment → Web App
//      - Execute as: Me
//      - Who has access: Anyone
//   4. Click Deploy, copy the Web App URL
//   5. Paste that URL into SHEET_URL in src/App.js
// ─────────────────────────────────────────────────────────────────────────────

const IT_HEADERS  = ["id","product","manufacturer","name","assetTag","serial","acquisition","warranty","location","status","assignedTo","department","type","invoice"];
const ST_HEADERS  = ["id","particulars","qty","unitPrice","unitType","assetCode","vendorName","invoiceDate","invoiceNumber"];
const MOB_HEADERS = ["id","userName","mobileImei","mobileNo","modelName","invoiceNo","location"];
const PRN_HEADERS = ["id","outletName","serialNumber","modelName"];
const FA_HEADERS  = ["id","storeName","assetCode","serialNo","brandName","assetDetails","qty"];

// GET — load all data
function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var itSheet  = ss.getSheetByName("IT Assets");
    var stSheet  = ss.getSheetByName("Studio Inventory");
    var mobSheet = ss.getSheetByName("Mobile Phones");
    var prnSheet = ss.getSheetByName("Printers");
    var faSheet  = ss.getSheetByName("Fixed Assets");

    var result = {
      it:         itSheet  ? sheetToJson(itSheet,  IT_HEADERS)  : [],
      studio:     stSheet  ? sheetToJson(stSheet,  ST_HEADERS)  : [],
      mobile:     mobSheet ? sheetToJson(mobSheet, MOB_HEADERS) : [],
      printer:    prnSheet ? sheetToJson(prnSheet, PRN_HEADERS) : [],
      fixedasset: faSheet  ? sheetToJson(faSheet,  FA_HEADERS)  : []
    };

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// POST — save data
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss      = SpreadsheetApp.getActiveSpreadsheet();

    if (payload.type === "it") {
      var sheet = ss.getSheetByName("IT Assets") || ss.insertSheet("IT Assets");
      jsonToSheet(sheet, payload.data, IT_HEADERS);
    } else if (payload.type === "studio") {
      var sheet = ss.getSheetByName("Studio Inventory") || ss.insertSheet("Studio Inventory");
      jsonToSheet(sheet, payload.data, ST_HEADERS);
    } else if (payload.type === "mobile") {
      var sheet = ss.getSheetByName("Mobile Phones") || ss.insertSheet("Mobile Phones");
      jsonToSheet(sheet, payload.data, MOB_HEADERS);
    } else if (payload.type === "printer") {
      var sheet = ss.getSheetByName("Printers") || ss.insertSheet("Printers");
      jsonToSheet(sheet, payload.data, PRN_HEADERS);
    } else if (payload.type === "fixedasset") {
      var sheet = ss.getSheetByName("Fixed Assets") || ss.insertSheet("Fixed Assets");
      jsonToSheet(sheet, payload.data, FA_HEADERS);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function sheetToJson(sheet, headers) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1)
    .map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i] !== undefined ? String(row[i]) : ""; });
      return obj;
    })
    .filter(function(row) { return row.id && row.id.trim() !== ""; });
}

function jsonToSheet(sheet, data, headers) {
  sheet.clearContents();
  sheet.appendRow(headers);
  data.forEach(function(item) {
    sheet.appendRow(headers.map(function(h) { return item[h] || ""; }));
  });
}
