// backend/src/routes/beneficiaries.js
import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const r = Router();

// JSON file store (similar to cheques)
const DB = path.join(__dirname, "..", "data", "beneficiaries.json");
fs.mkdirSync(path.dirname(DB), { recursive: true });
if (!fs.existsSync(DB)) fs.writeFileSync(DB, "[]", "utf8");

const read = () => JSON.parse(fs.readFileSync(DB, "utf8"));
const write = (arr) => fs.writeFileSync(DB, JSON.stringify(arr, null, 2));

/**
 * GET /api/beneficiaries
 * Optional: ?q=search&limit=20
 */
r.get("/", requireAuth, (req, res) => {
  const all = read();
  let rows = all;

  const q = (req.query.q || "").toString().trim().toLowerCase();
  if (q) {
    rows = rows.filter((b) => {
      const name = (b.name || "").toLowerCase();
      const alias = (b.alias || "").toLowerCase();
      const notes = (b.notes || "").toLowerCase();
      return (
        name.includes(q) ||
        alias.includes(q) ||
        notes.includes(q)
      );
    });
  }

  const limit = Number(req.query.limit || 0);
  if (limit > 0) rows = rows.slice(0, limit);

  res.json(rows);
});

/**
 * POST /api/beneficiaries
 * Body: { name, alias?, hideByDefault?, notes? }
 */
r.post("/", requireAuth, (req, res) => {
  const { name, alias = "", hideByDefault = false, notes = "" } = req.body || {};
  if (!name || !name.toString().trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  const all = read();
  const normalizedName = name.toString().trim();

  // prevent duplicate name (case-insensitive)
  const exists = all.some(
    (b) => (b.name || "").toLowerCase() === normalizedName.toLowerCase()
  );
  if (exists) {
    return res.status(409).json({ message: "Beneficiary name already exists" });
  }

  const now = new Date().toISOString();
  const id = Date.now().toString(36);

  const record = {
    id,
    name: normalizedName,
    alias: alias ? alias.toString().trim() : "",
    hideByDefault: !!hideByDefault,
    notes: notes ? notes.toString().trim() : "",
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
 * Body: { name?, alias?, hideByDefault?, notes? }
 */
r.put("/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const all = read();
  const idx = all.findIndex((b) => b.id === id);
  if (idx < 0) return res.status(404).json({ message: "Not found" });

  const existing = all[idx];
  const { name, alias, hideByDefault, notes } = req.body || {};

  if (name !== undefined) {
    const newName = name.toString().trim();
    if (!newName) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const dup = all.some(
      (b) =>
        b.id !== id &&
        (b.name || "").toLowerCase() === newName.toLowerCase()
    );
    if (dup) {
      return res
        .status(409)
        .json({ message: "Another beneficiary with this name already exists" });
    }
    existing.name = newName;
  }

  if (alias !== undefined) {
    existing.alias = alias ? alias.toString().trim() : "";
  }

  if (hideByDefault !== undefined) {
    existing.hideByDefault = !!hideByDefault;
  }

  if (notes !== undefined) {
    existing.notes = notes ? notes.toString().trim() : "";
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
  const all = read();
  const idx = all.findIndex((b) => b.id === id);
  if (idx < 0) return res.status(404).json({ message: "Not found" });

  const [removed] = all.splice(idx, 1);
  write(all);
  return res.json({ ok: true, removed });
});

export default r;
