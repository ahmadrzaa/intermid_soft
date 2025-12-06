.// backend/src/routes/cheques.js
import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.js"; // <- token required

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const r = Router();

// simple JSON file store (you can swap to Mongo later without touching server.js)
const DB = path.join(__dirname, "..", "data", "cheques.json");
fs.mkdirSync(path.dirname(DB), { recursive: true });
if (!fs.existsSync(DB)) fs.writeFileSync(DB, "[]", "utf8");

const read = () => JSON.parse(fs.readFileSync(DB, "utf8"));
const write = (arr) => fs.writeFileSync(DB, JSON.stringify(arr, null, 2));

/**
 * Helper: normalize status to lowercase
 */
function normStatus(value) {
  return String(value || "").toLowerCase();
}

/**
 * List cheques
 * Optional query:
 *   - ?status=pending        -> Draft + Pending
 *   - ?status=pendingApproval / pending_approval -> Draft + Pending
 *   - ?status=draft,approved -> multiple statuses
 */
r.get("/", requireAuth, (req, res) => {
  const all = read();
  const { status } = req.query;

  // no filter – return everything
  if (!status) {
    return res.json(all);
  }

  // allow comma-separated statuses
  const raw = String(status).toLowerCase();
  const wanted = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const wantsPendingAgg = wanted.some(
    (s) =>
      s === "pending" ||
      s === "pendingapproval" ||
      s === "pending_approval"
  );

  const rows = all.filter((c) => {
    const st = normStatus(c.status);

    // pending / pendingApproval aggregator:
    if (wantsPendingAgg && (st === "pending" || st === "draft")) {
      return true;
    }

    // direct match (approved, printed, cancelled, etc.)
    return wanted.includes(st);
  });

  res.json(rows);
});

/** Create cheque (Staff/Manager/Admin) */
r.post("/", requireAuth, (req, res) => {
  const {
    bankName = "",
    bankCode = "",
    accountNumber = "",
    chequeNumber = "",
    date = "",
    currency = "BHD",
    amount = 0,
    amountWords = "",
    beneficiaryName = "",
    hideBeneficiary = false,
    notes = "",
  } = req.body || {};

  if (!bankName || !chequeNumber || !date || !amount) {
    return res.status(400).json({
      message: "bankName, chequeNumber, date, amount are required",
    });
  }

  const all = read();
  const id = Date.now().toString(36);
  const nowIso = new Date().toISOString();

  const payload = {
    id,
    // explicit "Pending" status for fresh cheques (Pending Approval)
    status: "Pending",
    bankName,
    bankCode,
    accountNumber,
    chequeNumber,
    date,
    currency,
    amount: Number(amount),
    amountWords,
    beneficiaryName: hideBeneficiary ? "" : beneficiaryName,
    hideBeneficiary: !!hideBeneficiary,
    notes,
    createdBy: {
      id: req.user?.id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  all.push(payload);
  write(all);
  res.status(201).json(payload);
});

/** Get one cheque */
r.get("/:id", requireAuth, (req, res) => {
  const x = read().find((c) => c.id === req.params.id);
  if (!x) return res.status(404).json({ message: "Not found" });
  res.json(x);
});

/** Update cheque (edit mode) */
r.put("/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const all = read();
  const idx = all.findIndex((c) => c.id === id);
  if (idx < 0) return res.status(404).json({ message: "Not found" });

  const existing = all[idx];

  const {
    bankName,
    bankCode,
    accountNumber,
    chequeNumber,
    date,
    currency,
    amount,
    amountWords,
    beneficiaryName,
    hideBeneficiary,
    notes,
    status,
  } = req.body || {};

  if (bankName !== undefined) {
    existing.bankName = String(bankName).trim();
  }
  if (bankCode !== undefined) {
    existing.bankCode = String(bankCode).trim();
  }
  if (accountNumber !== undefined) {
    existing.accountNumber = String(accountNumber).trim();
  }
  if (chequeNumber !== undefined) {
    existing.chequeNumber = String(chequeNumber).trim();
  }
  if (date !== undefined) {
    existing.date = String(date).trim();
  }
  if (currency !== undefined) {
    existing.currency = String(currency).trim() || "BHD";
  }
  if (amount !== undefined) {
    const num = Number(amount);
    if (Number.isNaN(num)) {
      return res.status(400).json({ message: "Amount must be a number" });
    }
    existing.amount = num;
  }
  if (amountWords !== undefined) {
    existing.amountWords = String(amountWords).trim();
  }

  // handle beneficiary + hide flag together
  let newHide = existing.hideBeneficiary;
  if (hideBeneficiary !== undefined) {
    newHide = !!hideBeneficiary;
  }

  let newBeneficiary = existing.beneficiaryName;
  if (beneficiaryName !== undefined) {
    newBeneficiary = String(beneficiaryName).trim();
  }

  existing.hideBeneficiary = newHide;
  existing.beneficiaryName = newHide ? "" : newBeneficiary;

  if (notes !== undefined) {
    existing.notes = String(notes).trim();
  }

  if (status !== undefined) {
    // no strict validation; frontend controls allowed values
    existing.status = String(status).trim();
  }

  existing.updatedAt = new Date().toISOString();
  all[idx] = existing;
  write(all);

  return res.json(existing);
});

/** Approve (Manager/Admin only) */
r.post("/:id/approve", requireAuth, (req, res) => {
  if (!["Manager", "Admin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Only Manager/Admin can approve" });
  }

  const all = read();
  const i = all.findIndex((c) => c.id === req.params.id);
  if (i < 0) return res.status(404).json({ message: "Not found" });

  const nowIso = new Date().toISOString();

  all[i].status = "Approved";
  all[i].approvedAt = nowIso;
  all[i].approvedBy = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  all[i].updatedAt = nowIso;

  write(all);
  res.json(all[i]);
});

/** Cancel (Manager/Admin only) */
r.post("/:id/cancel", requireAuth, (req, res) => {
  if (!["Manager", "Admin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Only Manager/Admin can cancel" });
  }

  const all = read();
  const i = all.findIndex((c) => c.id === req.params.id);
  if (i < 0) return res.status(404).json({ message: "Not found" });

  const nowIso = new Date().toISOString();

  // status wording kept as "Cancelled" but we normalize on frontend
  all[i].status = "Cancelled";
  all[i].cancelledAt = nowIso;
  all[i].cancelledBy = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  all[i].updatedAt = nowIso;

  write(all);
  res.json(all[i]);
});

/** Delete cheque */
r.delete("/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const all = read();

  const idx = all.findIndex(
    (c) => c.id === id || c._id === id
  );

  if (idx < 0) {
    return res.status(404).json({ message: "Cheque not found" });
  }

  const [removed] = all.splice(idx, 1);
  write(all);

  return res.json({ ok: true, removed });
});

export default r;
