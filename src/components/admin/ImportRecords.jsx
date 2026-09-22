// src/components/admin/ImportRecords.jsx
//
// Admin tool: bulk-import unclaimed_records from a CSV or Excel file.
// Supports LIC, mutual fund, bank, or any institution's data as long
// as columns roughly match (case-insensitive, flexible naming).
//
// Expected columns (any of these names will auto-map):
//   first_name / firstname / first name
//   middle_name / middlename / middle name  (optional)
//   last_name / lastname / last name
//   folio_number / folio / folio no          (optional)
//   phone_number / phone / mobile            (optional)
//   address                                   (optional)
//   state                                     (optional)
//   institution_name / institution / bank / company
//   asset_type / type / asset
//   amount / value / amt

import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabaseClient";

const COLUMN_MAP = {
  first_name: ["first_name", "firstname", "first name"],
  middle_name: ["middle_name", "middlename", "middle name"],
  last_name: ["last_name", "lastname", "last name"],
  folio_number: ["folio_number", "folio", "folio no", "folio number"],
  phone_number: ["phone_number", "phone", "mobile", "mobile number"],
  address: ["address"],
  state: ["state"],
  institution_name: ["institution_name", "institution", "bank", "company", "institution name"],
  asset_type: ["asset_type", "type", "asset", "asset type"],
  amount: ["amount", "value", "amt"],
};

function normalizeHeader(h) {
  return h.trim().toLowerCase();
}

function mapRow(rawRow) {
  const lowerRow = {};
  Object.keys(rawRow).forEach((k) => {
    lowerRow[normalizeHeader(k)] = rawRow[k];
  });

  const mapped = {};
  for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
    for (const alias of aliases) {
      if (lowerRow[alias] !== undefined && lowerRow[alias] !== "") {
        mapped[field] = lowerRow[alias];
        break;
      }
    }
  }

  // clean amount to a plain number
  if (mapped.amount) {
    mapped.amount = Number(String(mapped.amount).replace(/[^0-9.]/g, "")) || 0;
  }

  return mapped;
}

export default function ImportRecords({ onImported }) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setFileName(file.name);
    setParsing(true);

    const isExcel = /\.xlsx?$/i.test(file.name);

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: "array" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          const mapped = json.map(mapRow).filter((r) => r.first_name || r.institution_name);
          setRows(mapped);
        } catch (err) {
          setError("Could not read Excel file. Make sure it's a valid .xlsx/.xls file.");
        } finally {
          setParsing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          const mapped = res.data.map(mapRow).filter((r) => r.first_name || r.institution_name);
          setRows(mapped);
          setParsing(false);
        },
        error: () => {
          setError("Could not read CSV file.");
          setParsing(false);
        },
      });
    }
  }

  async function handleImport() {
    if (rows.length === 0) return;
    setImporting(true);
    setError(null);

    try {
      // Insert in batches of 500 (Supabase/Postgres safe batch size)
      const BATCH = 500;
      let inserted = 0;

      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const { error: insertErr } = await supabase.from("unclaimed_records").insert(batch);
        if (insertErr) throw insertErr;
        inserted += batch.length;
      }

      setResult(`✓ ${inserted} records imported successfully.`);
      setRows([]);
      setFileName("");
      onImported?.();
    } catch (err) {
      console.error(err);
      setError(err.message || "Import failed partway through. Check your data and try again.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl text-ink mb-2">Import Records</h2>
      <p className="text-stone text-sm mb-6">
        Upload a CSV or Excel file with unclaimed money records (LIC, mutual funds, banks, etc.).
        Columns are auto-matched by name — order doesn't matter.
      </p>

      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFile}
        className="text-sm mb-4"
      />

      {parsing && <p className="text-stone text-sm">Reading file…</p>}
      {error && <p className="text-clay text-sm mb-3" role="alert">{error}</p>}
      {result && <p className="text-pine text-sm mb-3">{result}</p>}

      {rows.length > 0 && (
        <>
          <p className="text-sm text-stone mb-2">
            {fileName} — {rows.length} rows detected. Preview (first 5):
          </p>
          <div className="overflow-x-auto mb-4 border border-ink/10">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-parchment-dim text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Institution</th>
                  <th className="p-2">Asset Type</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t border-ink/5">
                    <td className="p-2">{r.first_name} {r.middle_name} {r.last_name}</td>
                    <td className="p-2">{r.institution_name || "—"}</td>
                    <td className="p-2">{r.asset_type || "—"}</td>
                    <td className="p-2 text-right">₹{Number(r.amount || 0).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="bg-pine text-parchment px-5 py-2.5 text-sm font-medium hover:bg-pine-light transition disabled:opacity-50"
          >
            {importing ? "Importing…" : `Import ${rows.length} records`}
          </button>
        </>
      )}
    </div>
  );
}