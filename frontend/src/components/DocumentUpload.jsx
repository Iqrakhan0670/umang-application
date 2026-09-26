import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const DOC_TYPE_OPTIONS = [
  "PAN Card",
  "Aadhaar Card",
  "Bank Passbook / Cancelled Cheque",
  "Death Certificate (if claiming on behalf of deceased holder)",
  "Legal Heir / Succession Certificate",
  "Other",
];

const MAX_FILE_MB = 5;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function DocumentUpload({ claimId, userId }) {
  const [docType, setDocType] = useState(DOC_TYPE_OPTIONS[0]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, [claimId]);

  async function fetchDocuments() {
    const { data, error: fetchErr } = await supabase
      .from("claim_documents")
      .select("*")
      .eq("claim_id", claimId)
      .order("uploaded_at", { ascending: false });

    if (!fetchErr) setDocuments(data || []);
  }

  function validateFile(f) {
    if (!f) return "Please choose a file";
    if (!ALLOWED_TYPES.includes(f.type)) return "Only PDF, JPG or PNG files are allowed";
    if (f.size > MAX_FILE_MB * 1024 * 1024) return `File must be under ${MAX_FILE_MB}MB`;
    return null;
  }

  async function handleUpload(e) {
    e.preventDefault();
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${userId}/${claimId}/${docType.replace(/\s+/g, "_")}-${Date.now()}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from("claim-documents")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase.from("claim_documents").insert({
        claim_id: claimId,
        user_id: userId,
        doc_type: docType,
        file_path: path,
        file_name: file.name,
        file_size_bytes: file.size,
      });

      if (insertErr) throw insertErr;

      setFile(null);
      await fetchDocuments();
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-serif text-lg text-ink mb-3">Upload Documents</h3>
      <form onSubmit={handleUpload} className="flex flex-col gap-3 mb-4">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="border border-ink/20 bg-transparent py-2 px-2 text-sm focus:outline-none focus:border-pine transition"
        >
          {DOC_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm"
        />
        <button
          type="submit"
          disabled={uploading}
          className="bg-pine text-parchment py-2 text-sm font-medium hover:bg-pine-light transition disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>
      {error && <p className="text-xs text-clay mb-3" role="alert">{error}</p>}

      <ul className="space-y-2 text-sm">
        {documents.map((doc) => (
          <li key={doc.id} className="flex justify-between border-b border-ink/10 pb-2">
            <span>{doc.doc_type} — {doc.file_name}</span>
            <span className={doc.verified ? "text-pine" : "text-stone"}>
              {doc.verified ? "✓ Verified" : doc.rejection_reason ? `✗ ${doc.rejection_reason}` : "Pending review"}
            </span>
          </li>
        ))}
        {documents.length === 0 && (
          <li className="text-stone text-sm">No documents uploaded yet.</li>
        )}
      </ul>
    </div>
  );
}