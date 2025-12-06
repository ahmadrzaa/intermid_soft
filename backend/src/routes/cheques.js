// backend/src/routes/cheques.js

import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const r = Router();

// Simple JSON file store (can swap to Mongo later)
const DB = path.join(__dirname, "..", "data", "cheques.json");
fs.mkdirSync(path.dirname(DB), { recursive: true });
if (!fs.existsSync(DB)) {
  fs.writeFileSync(DB, "[]", "utf8");
}

// ---- helpers ----
function read() {
  try {
    const text = fs.readFileSync(DB, "utf8");
    return text ? JSON.parse(text) : [];
  } catch (err) {
    console.error("Failed reading cheques DB:", err);
    return [];
  }
}

function write(arr) {
  try {
    fs.writeFileSync(DB, JSON.stringify(arr, null, 2));
  } catch (err) {
    console.error("Failed writing cheques DB:", err);
  }
}

function normStatus(value) {
  return String(value || "").trim().toLowerCase();
}

/**
 * GET /api/cheques
 * Optional query:
 *   ?status=pending         -> Draft + Pending
 *   ?status=pendingApproval -> Draft + Pending
 *   ?status=draft,approved  -> custom list
 */
r.get("/", requireAuth, (req, res) => {
  const all = read();
  const status = req.query.status;

  if (!status) {
    return res.json(all);
  }

  const raw = String(status).toLowerCase();
  const wanted = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const wantsPendingAgg = wanted.some((s) => {
    return (
      s === "pending" ||
      s === "pendingapproval" ||
      s === "pending_approval"
    );
  });

  const rows = all.filter((c) => {
    const st = normStatus(c.status);

    // pending aggregator
    if (wantsPendingAgg && (st === "pending" || st === "draft")) {
      return true;
    }

    // direct match
    return wanted.indexOf(st) !== -1;
  });

  res.json(rows);
});

/**
 * POST /api/cheques
 * Create cheque – initial status "Pending" (Pending approval)
 */
r.post("/", requireAuth, (req, res) => {
  const body = req.body || {};

  const bankName = body.bankName || "";
  const bankCode = body.bankCode || "";
  const accountNumber = body.accountNumber || "";
  const chequeNumber = body.chequeNumber || "";
  const date = body.date || "";
  const currency = body.currency || "BHD";
  const amount = body.amount;
  const amountWords = body.amountWords || "";
  const beneficiaryName = body.beneficiaryName || "";
  const hideBeneficiary = !!body.hideBeneficiary;
  const notes = body.notes || "";

  if (!bankName || !chequeNumber || !date || amount === undefined || amount === null) {
    return res.status(400).json({
      message: "bankName, chequeNumber, date, amount are required",
    });
  }

  const user = req.user || {};
  const all = read();
  const id = Date.now().toString(36);
  const nowIso = new Date().toISOString();

  const payload = {
    id: id,
    status: "Pending", // new cheques are waiting for approval
    bankName: bankName,
    bankCode: bankCode,
    accountNumber: accountNumber,
    chequeNumber: chequeNumber,
    date: date,
    currency: currency || "BHD",
    amount: Number(amount),
    amountWords: amountWords,
    beneficiaryName: hideBeneficiary ? "" : beneficiaryName,
    hideBeneficiary: hideBeneficiary,
    notes: notes,
    createdBy: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  all.push(payload);
  write(all);
  res.status(201).json(payload);
});

/**
 * GET /api/cheques/:id
 */
r.get("/:id", requireAuth, (req, res) => {
  const id = req.params.id;
  const x = read().find((c) => c.id === id || c._id === id);
  if (!x) {
    return res.status(404).json({ message: "Not found" });
  }
  res.json(x);
});

/**
 * PUT /api/cheques/:id
 * Update cheque
 */
r.put("/:id", requireAuth, (req, res) => {
  const id = req.params.id;
  const all = read();

  const idx = all.findIndex((c) => c.id === id || c._id === id);
  if (idx < 0) {
    return res.status(404).json({ message: "Not found" });
  }

  const existing = all[idx];
  const body = req.body || {};

  if (body.bankName !== undefined) {
    existing.bankName = String(body.bankName).trim();
  }
  if (body.bankCode !== undefined) {
    existing.bankCode = String(body.bankCode).trim();
  }
  if (body.accountNumber !== undefined) {
    existing.accountNumber = String(body.accountNumber).trim();
  }
  if (body.chequeNumber !== undefined) {
    existing.chequeNumber = String(body.chequeNumber).trim();
  }
  if (body.date !== undefined) {
    existing.date = String(body.date).trim();
  }
  if (body.currency !== undefined) {
    existing.currency = String(body.currency || "BHD").trim();
  }
  if (body.amount !== undefined) {
    const num = Number(body.amount);
    if (Number.isNaN(num)) {
      return res.status(400).json({ message: "Amount must be a number" });
    }
    existing.amount = num;
  }
  if (body.amountWords !== undefined) {
    existing.amountWords = String(body.amountWords).trim();
  }

  // handle beneficiary + hide flag together
  let newHide = existing.hideBeneficiary;
  if (body.hideBeneficiary !== undefined) {
    newHide = !!body.hideBeneficiary;
  }

  let newBeneficiary = existing.beneficiaryName;
  if (body.beneficiaryName !== undefined) {
    newBeneficiary = String(body.beneficiaryName).trim();
  }

  existing.hideBeneficiary = newHide;
  existing.beneficiaryName = newHide ? "" : newBeneficiary;

  if (body.notes !== undefined) {
    existing.notes = String(body.notes).trim();
  }

  if (body.status !== undefined) {
    existing.status = String(body.status).trim();
  }

  existing.updatedAt = new Date().toISOString();
  all[idx] = existing;
  write(all);

  return res.json(existing);
});

/**
 * POST /api/cheques/:id/approve
 * Manager/Admin only
 */
r.post("/:id/approve", requireAuth, (req, res) => {
  const user = req.user || {};
  const role = user.role || "";

  if (["Manager", "Admin"].indexOf(role) === -1) {
    return res
      .status(403)
      .json({ message: "Only Manager/Admin can approve" });
  }

  const all = read();
  const id = req.params.id;
  const i = all.findIndex((c) => c.id === id || c._id === id);
  if (i < 0) {
    return res.status(404).json({ message: "Not found" });
  }

  const nowIso = new Date().toISOString();

  all[i].status = "Approved";
  all[i].approvedAt = nowIso;
  all[i].approvedBy = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  all[i].updatedAt = nowIso;

  write(all);
  res.json(all[i]);
});

/**
 * POST /api/cheques/:id/cancel
 * Manager/Admin only
 */
r.post("/:id/cancel", requireAuth, (req, res) => {
  const user = req.user || {};
  const role = user.role || "";

  if (["Manager", "Admin"].indexOf(role) === -1) {
    return res
      .status(403)
      .json({ message: "Only Manager/Admin can cancel" });
  }

  const all = read();
  const id = req.params.id;
  const i = all.findIndex((c) => c.id === id || c._id === id);
  if (i < 0) {
    return res.status(404).json({ message: "Not found" });
  }

  const nowIso = new Date().toISOString();

  all[i].status = "Cancelled";
  all[i].cancelledAt = nowIso;
  all[i].cancelledBy = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  all[i].updatedAt = nowIso;

  write(all);
  res.json(all[i]);
});

/**
 * DELETE /api/cheques/:id
 */
r.delete("/:id", requireAuth, (req, res) => {
  const id = req.params.id;
  const all = read();

  const idx = all.findIndex((c) => c.id === id || c._id === id);
  if (idx < 0) {
    return res.status(404).json({ message: "Cheque not found" });
  }

  const removed = all.splice(idx, 1)[0];
  write(all);

  return res.json({ ok: true, removed });
});

export default r;
