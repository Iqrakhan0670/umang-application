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

import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabaseClient";
import { UploadCloud, FileSpreadsheet, X, AlertTriangle, CheckCircle2 } from "lucide-react";

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

const BATCH = 500;

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

  if (mapped.amount) {
    mapped.amount = Number(String(mapped.amount).replace(/[^0-9.]/g, "")) || 0;
  }

  return mapped;
}

// A row is "valid" only if it has enough info to be useful downstream
function isRowValid(r) {
  return Boolean(r.first_name && r.institution_name);
}

export default function ImportRecords({ onImported }) {
  const [rows, setRows] = useState([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  function reset() {
    setRows([]);
    setSkippedCount(0);
    setInvalidCount(0);
    setFileName("");
    setResult(null);
    setError(null);
    setProgress(0);
  }

  function processFile(file) {
    if (!file) return;
    const isCsv = /\.csv$/i.test(file.name);
    const isExcel = /\.xlsx?$/i.test(file.name);

    if (!isCsv && !isExcel) {
      setError("Unsupported file type. Please upload a .csv, .xlsx or .xls file.");
      return;
    }

    reset();
    setFileName(file.name);
    setParsing(true);

    const finalize = (rawRows) => {
      const totalRaw = rawRows.length;
      const mapped = rawRows.map(mapRow);
      // Drop fully empty rows (no name AND no institution — likely blank lines)
      const nonEmpty = mapped.filter((r) => r.first_name || r.institution_name);
      const valid = nonEmpty.filter(isRowValid);
      setSkippedCount(totalRaw - nonEmpty.length);
      setInvalidCount(nonEmpty.length - valid.length);
      setRows(valid);
      setParsing(false);
    };

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: "array" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          finalize(json);
        } catch (err) {
          setError("Could not read Excel file. Make sure it's a valid .xlsx/.xls file.");
          setParsing(false);
        }
      };
      reader.onerror = () => {
        setError("Could not open the file.");
        setParsing(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => finalize(res.data),
        error: () => {
          setError("Could not read CSV file.");
          setParsing(false);
        },
      });
    }
  }

  function handleFileInput(e) {
    processFile(e.target.files[0]);
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    processFile(e.dataTransfer.files?.[0]);
  }, []);

  async function handleImport() {
    if (rows.length === 0) return;
    setImporting(true);
    setError(null);
    setProgress(0);

    try {
      let inserted = 0;

      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const { error: insertErr } = await supabase.from("unclaimed_records").insert(batch);
        if (insertErr) throw insertErr;
        inserted += batch.length;
        setProgress(Math.round((inserted / rows.length) * 100));
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
      <h2 className="font-serif text-2xl text-gray-900 mb-2">Import Records</h2>
      <p className="text-gray-500 text-sm mb-6">
        Upload a CSV or Excel file with unclaimed money records (LIC, mutual funds, banks, etc.).
        Columns are auto-matched by name — order doesn't matter.
      </p>

      {!fileName && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-12 px-6 cursor-pointer text-center transition ${
            dragActive ? "border-emerald-600 bg-emerald-50" : "border-gray-200 hover:border-emerald-400"
          }`}
        >
          <UploadCloud size={28} className="text-gray-500" />
          <p className="text-sm text-gray-900 font-medium">Drag & drop your file here, or click to browse</p>
          <p className="text-xs text-gray-500">Supports .csv, .xlsx, .xls</p>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileInput} className="hidden" />
        </label>
      )}

      {parsing && (
        <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
          <div className="h-3.5 w-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
          Reading file…
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-emerald-700 text-sm mt-4 bg-emerald-50 border border-emerald-200 rounded-md p-3" role="alert">
          <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm mt-4 bg-emerald-50 border border-emerald-200 rounded-md p-3">
          <CheckCircle2 size={15} />
          <span>{result}</span>
        </div>
      )}

      {fileName && !parsing && (
        <div className="flex items-center justify-between border border-gray-200 rounded-md px-4 py-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-900">
            <FileSpreadsheet size={15} className="text-gray-500" />
            {fileName}
          </div>
          <button onClick={reset} className="text-gray-500 hover:text-gray-900 transition" aria-label="Remove file">
            <X size={15} />
          </button>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-4 mb-2">
            <span>
              <strong className="text-gray-900">{rows.length}</strong> rows ready to import
            </span>
            {invalidCount > 0 && (
              <span className="text-emerald-700">
                {invalidCount} rows skipped — missing name or institution
              </span>
            )}
            {skippedCount > 0 && <span>{skippedCount} blank rows ignored</span>}
          </div>

          <p className="text-sm text-gray-500 mb-2">Preview (first 5):</p>
          <div className="overflow-x-auto mb-4 border border-gray-200 rounded-md">
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr className="bg-emerald-50 text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Institution</th>
                  <th className="p-2">Asset Type</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="p-2">{r.first_name} {r.middle_name} {r.last_name}</td>
                    <td className="p-2">{r.institution_name || "—"}</td>
                    <td className="p-2">{r.asset_type || "—"}</td>
                    <td className="p-2 text-right">₹{Number(r.amount || 0).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {importing && (
            <div className="mb-3">
              <div className="h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{progress}% imported…</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium rounded-md hover:bg-emerald-500 transition disabled:opacity-50"
            >
              {importing ? "Importing…" : `Import ${rows.length} records`}
            </button>
            {!importing && (
              <button
                onClick={reset}
                className="px-5 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-md hover:border-emerald-400 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}