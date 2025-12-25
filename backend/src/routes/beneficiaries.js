/* =========================================================
 * INTERMID Beneficiaries / Payees API
 * Mounted at: /api/beneficiaries
 * Storage: backend/src/data/beneficiaries.json
 * =======================================================*/

import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

// Protect all endpoints (same as subscription/auth style)
r.use(requireAuth);

// -------------------- File Store --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "beneficiaries.json");

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]", "utf8");
}

function readStore() {
  ensureStore();
  try {
    const raw = fs.readFileSync(FILE, "utf8").trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    fs.writeFileSync(FILE, "[]", "utf8");
    return [];
  }
}

function writeStore(items) {
  ensureStore();
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2), "utf8");
  fs.renameSync(tmp, FILE);
}

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function s(v) {
  return v === null || v === undefined ? "" : String(v);
}

function cleanObj(obj) {
  // Keep all fields (don’t delete logic), but normalize common ones
  const o = obj && typeof obj === "object" ? { ...obj } : {};

  // Common naming variants
  if (o.name !== undefined) o.name = s(o.name).trim();
  if (o.title !== undefined) o.title = s(o.title).trim();

  if (o.bank !== undefined) o.bank = s(o.bank).trim();
  if (o.iban !== undefined) o.iban = s(o.iban).trim();
  if (o.accountNo !== undefined) o.accountNo = s(o.accountNo).trim();
  if (o.accountNumber !== undefined) o.accountNumber = s(o.accountNumber).trim();

  if (o.phone !== undefined) o.phone = s(o.phone).trim();
  if (o.email !== undefined) o.email = s(o.email).trim();

  // derive displayName if not present (optional)
  if (!o.displayName) {
    const candidate = o.name || o.title || o.payeeName || "";
    if (candidate) o.displayName = s(candidate).trim();
  } else {
    o.displayName = s(o.displayName).trim();
  }

  return o;
}

function pickSearchText(item) {
  // Search across many possible keys (flexible for your existing frontend)
  const keys = [
    "displayName",
    "name",
    "title",
    "payeeName",
    "bank",
    "iban",
    "accountNo",
    "accountNumber",
    "email",
    "phone",
    "notes",
  ];
  return keys.map((k) => s(item?.[k])).join(" ").toLowerCase();
}

function sortItems(items, sortBy, dir) {
  const direction = String(dir || "desc").toLowerCase() === "asc" ? 1 : -1;
  const key = String(sortBy || "updatedAt").trim();

  const get = (x) => {
    const v = x?.[key];
    if (v === undefined || v === null) return "";
    return typeof v === "string" ? v.toLowerCase() : v;
  };

  return [...items].sort((a, b) => {
    const va = get(a);
    const vb = get(b);
    if (va < vb) return -1 * direction;
    if (va > vb) return 1 * direction;
    return 0;
  });
}

// -------------------- Helpers --------------------
function okList(req, res) {
  const items = readStore();

  // Optional query params: ?q= ?limit= ?offset= ?sortBy= ?dir=
  const q = s(req.query?.q).trim().toLowerCase();
  const limit = Math.max(0, Math.min(500, Number(req.query?.limit || 0) || 0)); // 0 = no limit
  const offset = Math.max(0, Number(req.query?.offset || 0) || 0);
  const sortBy = s(req.query?.sortBy || "updatedAt");
  const dir = s(req.query?.dir || "desc");

  let out = items;

  if (q) {
    out = out.filter((it) => pickSearchText(it).includes(q));
  }

  out = sortItems(out, sortBy, dir);

  const total = out.length;
  if (limit > 0) out = out.slice(offset, offset + limit);
  else if (offset > 0) out = out.slice(offset);

  return res.json({ ok: true, items: out, total });
}

function findById(items, id) {
  const sid = s(id).trim();
  return items.find((x) => s(x?.id) === sid) || null;
}

// -------------------- Routes --------------------

// ✅ Main list endpoint
// GET /api/beneficiaries
r.get("/", okList);

// ✅ Aliases used by different screens (your log shows these are being called)
// GET /api/beneficiaries/payees
r.get("/payees", okList);

// GET /api/beneficiaries/cheque-beneficiaries
r.get("/cheque-beneficiaries", okList);

// ✅ Some frontend calls singular route without id
// GET /api/beneficiaries/beneficiary
// GET /api/beneficiaries/beneficiary?id=123
r.get("/beneficiary", (req, res) => {
  const id = s(req.query?.id).trim();
  if (!id) return okList(req, res);

  const items = readStore();
  const found = findById(items, id);
  if (!found) return res.status(404).json({ ok: false, message: "Beneficiary not found" });
  return res.json({ ok: true, item: found });
});

// ✅ Get single by path id
// GET /api/beneficiaries/:id
r.get("/:id", (req, res) => {
  const items = readStore();
  const found = findById(items, req.params.id);
  if (!found) return res.status(404).json({ ok: false, message: "Beneficiary not found" });
  return res.json({ ok: true, item: found });
});

// ✅ Create
// POST /api/beneficiaries
r.post("/", (req, res) => {
  const items = readStore();
  const payload = cleanObj(req.body);

  // Minimal validation (won't break existing data)
  const name = s(payload.displayName || payload.name || payload.title || payload.payeeName).trim();
  if (!name) {
    return res.status(400).json({ ok: false, message: "Name is required" });
  }

  const now = nowIso();
  const item = {
    id: newId(),
    ...payload,
    displayName: s(payload.displayName || name).trim(),
    createdAt: now,
    updatedAt: now,
  };

  items.unshift(item);
  writeStore(items);

  return res.status(201).json({ ok: true, item });
});

// ✅ Update (full replace-style)
// PUT /api/beneficiaries/:id
r.put("/:id", (req, res) => {
  const items = readStore();
  const id = s(req.params.id).trim();
  const idx = items.findIndex((x) => s(x?.id) === id);
  if (idx < 0) return res.status(404).json({ ok: false, message: "Beneficiary not found" });

  const prev = items[idx] || {};
  const patch = cleanObj(req.body);

  const merged = {
    ...prev,
    ...patch,
    id: prev.id, // never change
    createdAt: prev.createdAt || nowIso(),
    updatedAt: nowIso(),
  };

  // Keep displayName consistent
  if (!s(merged.displayName).trim()) {
    const nm = s(merged.name || merged.title || merged.payeeName).trim();
    if (nm) merged.displayName = nm;
  }

  items[idx] = merged;
  writeStore(items);

  return res.json({ ok: true, item: merged });
});

// ✅ Patch (partial update)
// PATCH /api/beneficiaries/:id
r.patch("/:id", (req, res) => {
  const items = readStore();
  const id = s(req.params.id).trim();
  const idx = items.findIndex((x) => s(x?.id) === id);
  if (idx < 0) return res.status(404).json({ ok: false, message: "Beneficiary not found" });

  const prev = items[idx] || {};
  const patch = cleanObj(req.body);

  const merged = {
    ...prev,
    ...patch,
    id: prev.id,
    createdAt: prev.createdAt || nowIso(),
    updatedAt: nowIso(),
  };

  if (!s(merged.displayName).trim()) {
    const nm = s(merged.name || merged.title || merged.payeeName).trim();
    if (nm) merged.displayName = nm;
  }

  items[idx] = merged;
  writeStore(items);

  return res.json({ ok: true, item: merged });
});

// ✅ Delete
// DELETE /api/beneficiaries/:id
r.delete("/:id", (req, res) => {
  const items = readStore();
  const id = s(req.params.id).trim();
  const idx = items.findIndex((x) => s(x?.id) === id);
  if (idx < 0) return res.status(404).json({ ok: false, message: "Beneficiary not found" });

  const removed = items.splice(idx, 1)[0];
  writeStore(items);
  return res.json({ ok: true, item: removed });
});

export default r;
