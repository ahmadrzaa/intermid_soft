// backend/src/middleware/subscription.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "subscriptions.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

export function readSubsStore() {
  ensureStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return raw ? JSON.parse(raw) : [];
  } catch {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
    return [];
  }
}

export function writeSubsStore(data) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
}
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Number(months || 0));
  return d;
}
function addYears(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + Number(years || 0));
  return d;
}

function getCfg() {
  return {
    trialDays: Number(process.env.SUB_TRIAL_DAYS || 10),
    graceDays: Number(process.env.SUB_GRACE_DAYS || 3),
  };
}

/**
 * ✅ computeSubscription(user, record)
 * Returns a normalized subscription object (trial/active/past_due/locked)
 */
export function computeSubscription(user, record) {
  const cfg = getCfg();
  const role = String(user?.role || "").toLowerCase();

  // Admin bypass
  if (role === "admin") {
    return {
      userId: user?.id || user?._id,
      status: "active",
      plan: "admin",
      locked: false,
      reason: "Admin bypass (not blocked).",
      trialEndsAt: null,
      periodEndsAt: null,
      graceEndsAt: null,
      updatedAt: new Date().toISOString(),
    };
  }

  const now = new Date();

  // First time => start trial
  if (!record) {
    const createdAt = new Date();
    const trialEndsAt = addDays(createdAt, cfg.trialDays);
    const graceEndsAt = addDays(trialEndsAt, cfg.graceDays);

    return {
      userId: user?.id || user?._id,
      status: "trial",
      plan: "trial",
      locked: false,
      reason: "Trial active.",
      createdAt: createdAt.toISOString(),
      trialEndsAt: trialEndsAt.toISOString(),
      periodEndsAt: null,
      graceEndsAt: graceEndsAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const trialEndsAt = record.trialEndsAt ? new Date(record.trialEndsAt) : null;
  const periodEndsAt = record.periodEndsAt ? new Date(record.periodEndsAt) : null;
  const graceEndsAt = record.graceEndsAt ? new Date(record.graceEndsAt) : null;

  // If has paid plan
  if (record.plan === "monthly" || record.plan === "yearly") {
    if (periodEndsAt && periodEndsAt > now) {
      return { ...record, status: "active", locked: false, reason: "Subscription active." };
    }
    if (graceEndsAt && graceEndsAt > now) {
      return { ...record, status: "past_due", locked: false, reason: "Payment due. Grace period running." };
    }
    return { ...record, status: "locked", locked: true, reason: "Subscription expired. Please pay to continue." };
  }

  // Trial
  if (trialEndsAt && trialEndsAt > now) {
    return { ...record, status: "trial", locked: false, reason: "Trial active." };
  }
  if (graceEndsAt && graceEndsAt > now) {
    return { ...record, status: "past_due", locked: false, reason: "Trial ended. Please pay during grace period." };
  }
  return { ...record, status: "locked", locked: true, reason: "Trial ended. Please subscribe to continue." };
}

/**
 * Optional middleware to protect routes
 */
export function requireActiveSubscription(req, res, next) {
  const subs = readSubsStore();
  const userId = req.user?.id || req.user?._id;
  const record = subs.find((s) => s.userId === userId) || null;
  const computed = computeSubscription(req.user, record);

  if (computed.status === "locked") {
    return res.status(402).json({ ok: false, message: "Subscription required." });
  }
  return next();
}
