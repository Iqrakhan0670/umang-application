import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ---------------- theme ---------------- */
const EMERALD_DARK = [4, 46, 34];   // emerald-950-ish
const EMERALD = [5, 150, 105];      // emerald-600
const MINT = [236, 253, 245];       // emerald-50
const GRAY = [100, 116, 139];       // slate-500
const TEXT = [15, 23, 42];          // slate-900

const PAGE_W = 210;
const MARGIN = 16;

/* ---------------- helpers ---------------- */

function money(v) {
  if (v === null || v === undefined || v === "") return "Not available in source record";
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function maskRef(ref) {
  if (!ref) return "Not available in source record";
  const s = String(ref);
  if (s.length <= 4) return "••••";
  return `${"•".repeat(s.length - 4)}${s.slice(-4)}`;
}

const REQUIRED_DOCS = {
  "Mutual Fund": ["PAN", "Aadhaar / KYC document", "Bank account details", "Cancelled cheque / bank proof", "Folio-linked KYC form"],
  "Fixed Deposit": ["PAN", "Aadhaar / KYC document", "Original/duplicate FD receipt, if available", "Bank account details"],
  "Bank Deposit": ["PAN", "Aadhaar / KYC document", "Bank account proof", "Nominee documents, if applicable"],
  "Insurance": ["Policy documents", "PAN", "Aadhaar / KYC document", "Nominee/legal-heir documents, where applicable"],
  "Shares": ["PAN", "Demat account details", "Shareholding proof", "Aadhaar / KYC document"],
  default: ["PAN", "Aadhaar / KYC document", "Bank account details", "Institution-specific claim form"],
};

const CLAIM_ROUTE = {
  "Mutual Fund": "Claim through the concerned Asset Management Company (AMC) or its Registrar & Transfer Agent.",
  "Fixed Deposit": "Claim through the concerned bank's unclaimed deposits / nomination desk.",
  "Bank Deposit": "Claim through the concerned bank's unclaimed deposits process, or via the RBI UDGAM portal.",
  "Insurance": "Claim through the concerned insurer's unclaimed policy proceeds process.",
  "Shares": "Claim through the concerned company's Registrar & Transfer Agent, or the IEPF process if transferred.",
  default: "Claim through the concerned institution's applicable official process.",
};

const STATUS_LABELS = {
  submitted: "Record Identified",
  under_review: "Assistance Started",
  documents_pending: "Documents Pending",
  filed_with_authority: "Claim Submitted",
  recovered: "Recovered",
  rejected: "Claim Rejected",
  cancelled: "Claim Cancelled",
};

const NEXT_ACTION = {
  submitted: "Review the required documents below and continue with the claim assistance process.",
  under_review: "Our team is reviewing your record. Please keep your documents ready.",
  documents_pending: "Please share the pending documents listed below to proceed.",
  filed_with_authority: "Your claim has been submitted to the concerned institution. We will update you on any response.",
  recovered: "Your claim has been recovered. Check the Settlements section for the success-fee breakdown.",
  rejected: "Your claim was not approved by the institution. Contact support to discuss next steps.",
  cancelled: "This claim has been cancelled. No further action is needed.",
};

/* ---------------- header / footer ---------------- */

function drawHeader(doc, title) {
  doc.setFillColor(...EMERALD_DARK);
  doc.rect(0, 0, PAGE_W, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("UMANG", MARGIN, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 240, 225);
  doc.text("Unclaimed Asset Search & Claim Assistance", MARGIN, 19);

  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, MARGIN, 34);
}

function drawFooter(doc, claimId) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(230, 230, 230);
    doc.line(MARGIN, 285, PAGE_W - MARGIN, 285);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(`Claim ID: ${claimId}`, MARGIN, 290);
    doc.text(`Generated: ${fmtDate(new Date())}`, PAGE_W / 2, 290, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, PAGE_W - MARGIN, 290, { align: "right" });
  }
}

function sectionTitle(doc, text, y) {
  doc.setFillColor(...MINT);
  doc.rect(MARGIN, y - 5, PAGE_W - MARGIN * 2, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...EMERALD_DARK);
  doc.text(text, MARGIN + 2, y);
  return y + 10;
}

function labelValue(doc, label, value, x, y, maxWidth) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(label, x, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT);
  const lines = doc.splitTextToSize(String(value ?? "—"), maxWidth);
  doc.text(lines, x, y + 5);
  return y + 5 + lines.length * 4.5;
}

/* ---------------- main export ---------------- */

/**
 * Generates the Claim Assistance Report PDF.
 *
 * @param {object} params
 * @param {object} params.claim  - row from claim_requests
 * @param {object} params.record - matched row from unclaimed_records (claim.unclaimed_records)
 * @param {object} params.user   - { name, email }
 * @param {string} [params.transactionId] - optional payment reference; falls back to claim id
 * @returns {jsPDF} doc — call doc.save(filename) or doc.output('bloburl') on it
 */
export function generateClaimReportPdf({ claim, record, user, transactionId }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const assetType = record?.asset_type || "Unclaimed Asset";
  const docsList = REQUIRED_DOCS[assetType] || REQUIRED_DOCS.default;
  const claimRoute = CLAIM_ROUTE[assetType] || CLAIM_ROUTE.default;
  const statusLabel = STATUS_LABELS[claim.status] || claim.status;
  const nextAction = NEXT_ACTION[claim.status] || "Continue tracking your claim status here.";

  /* ---------- PAGE 1 — Payment Receipt ---------- */
  drawHeader(doc, "Claim Assistance Fee Receipt");
  let y = 46;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT);
  doc.text("₹299 has been paid for UMANG Claim Assistance services.", MARGIN, y);
  y += 10;

  y = labelValue(doc, "User", user?.name || user?.email || "—", MARGIN, y, 85);
  y = labelValue(doc, "Claim ID", claim.id, MARGIN, y + 3, 85);
  const yRightCol = 46 + 0;
  labelValue(doc, "Reference / Transaction ID", transactionId || claim.id, 110, yRightCol, 85);
  labelValue(doc, "Assistance Fee", money(claim.assistance_fee_amount), 110, yRightCol + 18, 85);

  y += 10;
  y = labelValue(doc, "Payment Status", claim.assistance_fee_paid ? "Paid" : "Pending", MARGIN, y, 85);
  y = labelValue(
    doc,
    "Claim Started On",
    fmtDateTime(claim.created_at),
    110,
    y - 9.5,
    85
  );
  y = labelValue(doc, "Receipt Generated On", fmtDateTime(new Date()), MARGIN, y + 3, 85);

  y += 12;
  doc.setDrawColor(...EMERALD);
  doc.setFillColor(...MINT);
  doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, 16, 2, 2, "FD");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...EMERALD_DARK);
  doc.text(
    doc.splitTextToSize(
      "Note: ₹299 is an assistance/service fee and is separate from the value of the asset being claimed.",
      PAGE_W - MARGIN * 2 - 6
    ),
    MARGIN + 3,
    y + 6
  );

  /* ---------- PAGE 2 — Asset Summary ---------- */
  doc.addPage();
  drawHeader(doc, "Your Unclaimed Asset Report");
  y = 46;

  y = labelValue(doc, "Claim ID", claim.id, MARGIN, y, 85);
  y = labelValue(doc, "Report Generated", fmtDate(new Date()), 110, y - 9.5, 85);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Asset Type", "Institution", "Status", "Amount", "Where It Is"]],
    body: [[
      assetType,
      record?.institution_name || "Not available in source record",
      statusLabel,
      money(record?.amount),
      record?.institution_name || "Not available in source record",
    ]],
    styles: { fontSize: 8.5, textColor: TEXT, cellPadding: 3 },
    headStyles: { fillColor: EMERALD_DARK, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: MINT },
    margin: { left: MARGIN, right: MARGIN },
  });

  y = doc.lastAutoTable.finalY + 12;

  /* ---------- Asset-wise detail card ---------- */
  y = sectionTitle(doc, `Asset 01 — ${assetType}`, y);

  const colW = (PAGE_W - MARGIN * 2 - 6) / 2;
  let yLeft = y, yRight = y;
  yLeft = labelValue(doc, "Institution", record?.institution_name || "Not available in source record", MARGIN, yLeft, colW);
  yLeft = labelValue(doc, "Reference Number", maskRef(record?.folio_number), MARGIN, yLeft + 4, colW);
  yLeft = labelValue(doc, "Reported Amount / Value", money(record?.amount), MARGIN, yLeft + 4, colW);

  yRight = labelValue(doc, "Current Status", statusLabel, MARGIN + colW + 6, yRight, colW);
  yRight = labelValue(doc, "Record Date", fmtDate(record?.created_at), MARGIN + colW + 6, yRight + 4, colW);
  yRight = labelValue(doc, "Reason Unclaimed", "Reason not available in the source record.", MARGIN + colW + 6, yRight + 4, colW);

  y = Math.max(yLeft, yRight) + 8;

  // Where is it currently?
  y = sectionTitle(doc, "Where Is It Currently?", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  doc.text(`Institution: ${record?.institution_name || "Not available in source record"}`, MARGIN, y);
  y += 5;
  doc.text(`Current Status: ${statusLabel}`, MARGIN, y);
  y += 5;
  const routeLines = doc.splitTextToSize(`Claim Route: ${claimRoute}`, PAGE_W - MARGIN * 2);
  doc.text(routeLines, MARGIN, y);
  y += routeLines.length * 4.5 + 8;

  // Required documents
  y = sectionTitle(doc, "Documents You May Need", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  docsList.forEach((d) => {
    doc.text(`•  ${d}`, MARGIN + 2, y);
    y += 5;
  });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  const docNote = doc.splitTextToSize(
    "Required documents may vary depending on the institution, asset type and claimant circumstances.",
    PAGE_W - MARGIN * 2
  );
  doc.text(docNote, MARGIN, y + 2);

  /* ---------- PAGE 3 — Process, status, disclaimer ---------- */
  doc.addPage();
  drawHeader(doc, "Claim Process & Status");
  y = 46;

  y = sectionTitle(doc, "How To Claim", y);
  const roadmap = [
    "Asset Identified",
    "Check Required Documents",
    "Complete KYC / Ownership Verification",
    "Prepare Claim Forms",
    "Submit Claim to Concerned Institution / Authority",
    "Verification",
    "Claim Status Tracking",
    "Recovery / Release, if approved",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  roadmap.forEach((step, i) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...EMERALD);
    doc.text(`${i + 1}.`, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT);
    doc.text(step, MARGIN + 7, y);
    y += 5.5;
  });
  y += 6;

  y = sectionTitle(doc, "Claim Status", y);
  y = labelValue(doc, "Claim ID", claim.id, MARGIN, y, 85);
  y = labelValue(doc, "Current Status", statusLabel, 110, y - 9.5, 85);
  y = labelValue(doc, "Last Updated", fmtDateTime(claim.status_updated_at || claim.updated_at), MARGIN, y + 3, 85);
  y += 10;

  y = sectionTitle(doc, "Your Next Step", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  const nextLines = doc.splitTextToSize(nextAction, PAGE_W - MARGIN * 2);
  doc.text(nextLines, MARGIN, y);
  y += nextLines.length * 4.5 + 8;

  y = sectionTitle(doc, "Who Does What?", y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...EMERALD_DARK);
  doc.text("UMANG:", MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT);
  doc.text(
    doc.splitTextToSize(
      "Provides claim-process guidance, explains available records, offers document guidance, assists with claim preparation, and helps with status tracking.",
      PAGE_W - MARGIN * 2
    ),
    MARGIN,
    y + 5
  );
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...EMERALD_DARK);
  doc.text("Concerned Institution / Authority:", MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT);
  doc.text(
    doc.splitTextToSize(
      "Verifies ownership, reviews submitted documents, approves or rejects the claim per its own process, and releases the asset or funds where applicable.",
      PAGE_W - MARGIN * 2
    ),
    MARGIN,
    y + 5
  );
  y += 22;

  if (y > 250) {
    doc.addPage();
    y = 30;
  }
  y = sectionTitle(doc, "Important Information", y);
  const disclaimers = [
    "This report is based on available record data and is provided for informational and claim-assistance purposes.",
    "Finding a matching record does not by itself establish ownership.",
    "Final ownership verification, claim approval and release of funds/assets are determined by the concerned institution or authority.",
    "Reported amounts or values may change and should be verified with the concerned institution.",
    "Claim requirements and procedures may vary depending on the asset type and institution.",
    "UMANG is an independent service and is not affiliated with any government body or regulator.",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  disclaimers.forEach((line) => {
    const l = doc.splitTextToSize(`•  ${line}`, PAGE_W - MARGIN * 2);
    doc.text(l, MARGIN, y);
    y += l.length * 4 + 1.5;
  });

  drawFooter(doc, claim.id);
  return doc;
}