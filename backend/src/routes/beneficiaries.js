// backend/src/routes/beneficiaries.js
// Simple JSON-based Beneficiaries master list
// Add/edit/delete beneficiaries + flag to hide name on printed cheque.
// Extended fields: mobile, iban, accountNumber, email.

import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const r = Router();

// JSON file store (similar to cheques)
const DB = path.join(__dirname, "..", "data", "beneficiaries.json");
fs.mkdirSync(path.dirname(DB), { recursive: true });
if (!fs.existsSync(DB)) fs.writeFileSync(DB, "[]", "utf8");

function safeRead() {
  try {
    const raw = fs.readFileSync(DB, "utf8");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // if file is corrupted, reset to empty
    try {
      fs.writeFileSync(DB, "[]", "utf8");
    } catch (_) {}
    return [];
  }
}

function write(arr) {
  fs.writeFileSync(DB, JSON.stringify(arr, null, 2), "utf8");
}

function s(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function normalizeEmail(v) {
  const val = s(v);
  return val ? val.toLowerCase() : "";
}

/**
 * GET /api/beneficiaries
 * Optional: ?q=search&limit=20
 * Returns: array
 */
r.get("/", requireAuth, (req, res) => {
  const all = safeRead();
  let rows = all;

  const q = s(req.query.q).toLowerCase();
  if (q) {
    rows = rows.filter((b) => {
      const hay = [
        b.name,
        b.alias,
        b.notes,
        b.mobile,
        b.phone,
        b.iban,
        b.accountNumber,
        b.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }

  const limit = Number(req.query.limit || 0);
  if (limit > 0) rows = rows.slice(0, limit);

  res.json(rows);
});

/**
 * GET /api/beneficiaries/:id
 */
r.get("/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const all = safeRead();
  const found = all.find((b) => String(b.id) === String(id));
  if (!found) return res.status(404).json({ message: "Not found" });
  return res.json(found);
});

/**
 * POST /api/beneficiaries
 * Body:
 * {
 *   name,
 *   alias?,
 *   hideByDefault?,
 *   notes?,
 *   mobile? (or phone?),
 *   iban?,
 *   accountNumber?,
 *   email?
 * }
 */
r.post("/", requireAuth, (req, res) => {
  const body = req.body || {};

  const name = s(body.name);
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const alias = s(body.alias);
  const notes = s(body.notes);

  // accept either mobile or phone from frontend
  const mobile = s(body.mobile || body.phone);
  const iban = s(body.iban);
  const accountNumber = s(body.accountNumber);
  const email = normalizeEmail(body.email);

  const hideByDefault = !!body.hideByDefault;

  const all = safeRead();
  const normalizedName = name;

  // prevent duplicate name (case-insensitive)
  const exists = all.some(
    (b) => (b.name || "").toLowerCase() === normalizedName.toLowerCase()
  );
  if (exists) {
    return res.status(409).json({ message: "Beneficiary name already exists" });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);

  const record = {
    id,
    name: normalizedName,
    alias,
    hideByDefault, // true => default “keep name hidden on cheque”
    notes,

    // NEW FIELDS
    mobile,
    iban,
    accountNumber,
    email,

    createdAt: now,
    updatedAt: now,
    createdBy: {
      id: req.user?.id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
  };

  all.push(record);
  write(all);
  return res.status(201).json(record);
});

/**
 * PUT /api/beneficiaries/:id
 * Body: { name?, alias?, hideByDefault?, notes?, mobile?, phone?, iban?, accountNumber?, email? }
 */
r.put("/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const all = safeRead();
  const idx = all.findIndex((b) => String(b.id) === String(id));
  if (idx < 0) return res.status(404).json({ message: "Not found" });

  const existing = all[idx];
  const body = req.body || {};

  // name
  if (body.name !== undefined) {
    const newName = s(body.name);
    if (!newName) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const dup = all.some(
      (b) =>
        String(b.id) !== String(id) &&
        (b.name || "").toLowerCase() === newName.toLowerCase()
    );
    if (dup) {
      return res
        .status(409)
        .json({ message: "Another beneficiary with this name already exists" });
    }
    existing.name = newName;
  }

  // alias
  if (body.alias !== undefined) {
    existing.alias = s(body.alias);
  }

  // hide flag
  if (body.hideByDefault !== undefined) {
    existing.hideByDefault = !!body.hideByDefault;
  }

  // notes
  if (body.notes !== undefined) {
    existing.notes = s(body.notes);
  }

  // NEW fields (allow clearing by sending empty string)
  if (body.mobile !== undefined || body.phone !== undefined) {
    existing.mobile = s(body.mobile || body.phone);
  }

  if (body.iban !== undefined) {
    existing.iban = s(body.iban);
  }

  if (body.accountNumber !== undefined) {
    existing.accountNumber = s(body.accountNumber);
  }

  if (body.email !== undefined) {
    existing.email = normalizeEmail(body.email);
  }

  existing.updatedAt = new Date().toISOString();
  all[idx] = existing;
  write(all);

  return res.json(existing);
});

/**
 * DELETE /api/beneficiaries/:id
 */
r.delete("/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const all = safeRead();
  const idx = all.findIndex((b) => String(b.id) === String(id));
  if (idx < 0) return res.status(404).json({ message: "Not found" });

  const [removed] = all.splice(idx, 1);
  write(all);
  return res.json({ ok: true, removed });
});

export default r;
