// backend/src/routes/cheques.js
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

/** List (optional ?status=Draft|Approved) */
r.get("/", requireAuth, (req, res) => {
  const all = read();
  const { status } = req.query;
  const rows = status ? all.filter((c) => c.status === status) : all;
  res.json(rows);
});

/** Create cheque (Staff/Manager/Admin) */
r.post("/", requireAuth, (req, res) => {
  const {
    bankName = "",
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
  const payload = {
    id,
    status: "Draft", // approval separate
    bankName,
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
    createdAt: new Date().toISOString(),
  };
  all.push(payload);
  write(all);
  res.status(201).json(payload);
});

/** Get one */
r.get("/:id", requireAuth, (req, res) => {
  const x = read().find((c) => c.id === req.params.id);
  if (!x) return res.status(404).json({ message: "Not found" });
  res.json(x);
});

/** Approve (Manager/Admin only) */
r.post("/:id/approve", requireAuth, (req, res) => {
  if (!["Manager", "Admin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Only Manager/Admin can approve" });
  }
  const all = read();
  const i = all.findIndex((c) => c.id === req.params.id);
  if (i < 0) return res.status(404).json({ message: "Not found" });

  all[i].status = "Approved";
  all[i].approvedAt = new Date().toISOString();
  all[i].approvedBy = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
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

  all[i].status = "Cancelled";
  all[i].cancelledAt = new Date().toISOString();
  all[i].cancelledBy = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  write(all);
  res.json(all[i]);
});

export default r;
