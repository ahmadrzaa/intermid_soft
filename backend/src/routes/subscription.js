// backend/src/routes/subscription.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------
// Local JSON store
// NOTE: On Render this will NOT persist unless you use a persistent disk.
// For production use a DB (Mongo/Postgres).
// ------------------------
const DATA_DIR = path.join(__dirname, "..", "data");
const SUBS_FILE = path.join(DATA_DIR, "subscriptions.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SUBS_FILE)) fs.writeFileSync(SUBS_FILE, "[]", "utf8");
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, "utf8");
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  ensureStore();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function getUserId(req) {
  return req.user?.id || req.user?.userId || req.user?._id || null;
}

function isAdmin(req) {
  return String(req.user?.role || "").toLowerCase() === "admin";
}

function nowIso() {
  return new Date().toISOString();
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

function getConfig() {
  return {
    trialDays: Number(process.env.SUB_TRIAL_DAYS || 10),
    graceDays: Number(process.env.SUB_GRACE_DAYS || 3),
    monthlyBhd: Number(process.env.SUB_MONTHLY_BHD || 5),
    yearlyBhd: Number(process.env.SUB_YEARLY_BHD || 110),

    // Stripe account currency (must be supported by your Stripe account)
    stripeCurrency: String(process.env.STRIPE_CURRENCY || "aed").toLowerCase(),

    // OPTIONAL: if you want fixed AED charge amounts
    // SUB_MONTHLY_STRIPE=50  (AED)
    // SUB_YEARLY_STRIPE=1100 (AED)
    monthlyStripe: process.env.SUB_MONTHLY_STRIPE ? Number(process.env.SUB_MONTHLY_STRIPE) : null,
    yearlyStripe: process.env.SUB_YEARLY_STRIPE ? Number(process.env.SUB_YEARLY_STRIPE) : null,

    // if no fixed stripe amounts -> convert BHD to stripe currency
    // for AED you used around 9.75
    bhdToStripeRate: Number(process.env.BHD_TO_STRIPE_RATE || 9.75),
  };
}

function displayBhd(plan, cfg) {
  return plan === "yearly" ? cfg.yearlyBhd : cfg.monthlyBhd;
}

function chargeAmount(plan, cfg) {
  if (plan === "yearly" && cfg.yearlyStripe != null) return cfg.yearlyStripe;
  if (plan === "monthly" && cfg.monthlyStripe != null) return cfg.monthlyStripe;

  // convert BHD -> stripe currency
  return displayBhd(plan, cfg) * cfg.bhdToStripeRate;
}

function upsertSub(userId, patch) {
  const subs = readJson(SUBS_FILE, []);
  const idx = subs.findIndex((s) => s.userId === userId);

  const base = idx >= 0 ? subs[idx] : {
    userId,
    createdAt: nowIso(),
  };

  const next = {
    ...base,
    ...patch,
    userId,
    updatedAt: nowIso(),
  };

  if (idx >= 0) subs[idx] = next;
  else subs.push(next);

  writeJson(SUBS_FILE, subs);
  return next;
}

function computeStatus(sub) {
  const now = new Date();
  const plan = sub?.plan || "trial";

  const trialEndsAt = sub?.trialEndsAt ? new Date(sub.trialEndsAt) : null;
  const periodEndsAt = sub?.periodEndsAt ? new Date(sub.periodEndsAt) : null;
  const graceEndsAt = sub?.graceEndsAt ? new Date(sub.graceEndsAt) : null;

  // paid plan
  if (plan === "monthly" || plan === "yearly") {
    if (periodEndsAt && periodEndsAt > now) return { status: "active", locked: false, reason: "Subscription active." };
    if (graceEndsAt && graceEndsAt > now) return { status: "past_due", locked: false, reason: "Payment due. Grace period running." };
    return { status: "locked", locked: true, reason: "Subscription expired. Please pay to continue." };
  }

  // trial
  if (trialEndsAt && trialEndsAt > now) return { status: "trial", locked: false, reason: "Trial active." };
  if (graceEndsAt && graceEndsAt > now) return { status: "past_due", locked: false, reason: "Trial ended. Please pay during grace period." };
  return { status: "locked", locked: true, reason: "Trial ended. Please subscribe to continue." };
}

// ---------------- STATUS ----------------
router.get("/status", requireAuth, (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Invalid token user" });

  const cfg = getConfig();
  const subs = readJson(SUBS_FILE, []);
  let sub = subs.find((x) => x.userId === userId);

  // first time create trial record
  if (!sub) {
    const createdAt = new Date();
    const trialEndsAt = addDays(createdAt, cfg.trialDays);
    const graceEndsAt = addDays(trialEndsAt, cfg.graceDays);

    sub = upsertSub(userId, {
      plan: "trial",
      trialEndsAt: trialEndsAt.toISOString(),
      graceEndsAt: graceEndsAt.toISOString(),
      // keep payment fields empty
      lastPaymentAt: null,
      lastPaymentAmount: null,
      lastPaymentCurrency: null,
      hostedInvoiceUrl: null,
      invoicePdf: null,
      receiptUrl: null,
    });
  }

  const computed = computeStatus(sub);
  sub = upsertSub(userId, { ...computed });

  return res.json(sub);
});

// ---------------- CHECKOUT (embedded, inside app) ----------------
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Invalid token user" });

    const plan = String(req.body?.plan || "").toLowerCase();
    if (plan !== "monthly" && plan !== "yearly") {
      return res.status(400).json({ message: "Invalid plan. Use 'monthly' or 'yearly'." });
    }

    const cfg = getConfig();
    const bhd = displayBhd(plan, cfg);
    const charge = chargeAmount(plan, cfg);
    const unitAmount = Math.round(charge * 100);

    // Put email if you have it in token/user (optional)
    const customerEmail = req.user?.email || undefined;

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      customer_creation: "always",
      invoice_creation: { enabled: true }, // ✅ makes hosted invoice + invoice PDF
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: cfg.stripeCurrency,
          product_data: {
            name: `INTERMID Cheque Software (${plan})`,
            description: `Displayed: ${bhd} BHD | Charged: ${charge.toFixed(2)} ${cfg.stripeCurrency.toUpperCase()}`,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      return_url: `${process.env.FRONTEND_URL}/app/subscription?return=1&session_id={CHECKOUT_SESSION_ID}`,
      metadata: { userId, plan },
      customer_email: customerEmail,
    });

    return res.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (e) {
    console.error("Checkout error:", e);
    return res.status(500).json({ message: e.message || "Checkout failed" });
  }
});

// ---------------- CONFIRM (idempotent + stores PDF/receipt) ----------------
router.post("/confirm", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Invalid token user" });

    const sessionId = String(req.body?.session_id || "").trim();
    if (!sessionId) return res.status(400).json({ message: "Missing session_id" });

    // Idempotent: if already confirmed, return stored data
    const existing = readJson(SUBS_FILE, []).find((s) => s.userId === userId);
    if (existing?.lastPaymentSessionId === sessionId && existing?.status === "active") {
      return res.json({ ok: true, subscription: existing, alreadyConfirmed: true });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "invoice"],
    });

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed yet." });
    }

    const plan = String(session.metadata?.plan || "monthly").toLowerCase();
    if (plan !== "monthly" && plan !== "yearly") {
      return res.status(400).json({ message: "Invalid plan in session metadata." });
    }

    // Pull invoice urls (PDF slip)
    const hostedInvoiceUrl = session.invoice?.hosted_invoice_url || null;
    const invoicePdf = session.invoice?.invoice_pdf || null;

    // Pull receipt url (card receipt)
    let receiptUrl = null;
    const pi = session.payment_intent;
    if (pi?.latest_charge) {
      const charge = await stripe.charges.retrieve(pi.latest_charge);
      receiptUrl = charge?.receipt_url || null;
    }

    const cfg = getConfig();
    const now = new Date();
    const periodEndsAt = plan === "yearly" ? addYears(now, 1) : addMonths(now, 1);
    const graceEndsAt = addDays(periodEndsAt, cfg.graceDays);

    const saved = upsertSub(userId, {
      status: "active",
      locked: false,
      reason: "Payment confirmed.",
      plan,
      periodEndsAt: periodEndsAt.toISOString(),
      graceEndsAt: graceEndsAt.toISOString(),

      lastPaymentSessionId: session.id,
      lastPaymentAt: now.toISOString(),
      lastPaymentAmount: session.amount_total ? session.amount_total / 100 : null,
      lastPaymentCurrency: session.currency || null,

      hostedInvoiceUrl,
      invoicePdf,
      receiptUrl,
    });

    return res.json({ ok: true, subscription: saved });
  } catch (e) {
    console.error("Confirm error:", e);
    return res.status(500).json({ message: e.message || "Confirm failed" });
  }
});

// ---------------- USER HISTORY ----------------
router.get("/history", requireAuth, (req, res) => {
  const userId = getUserId(req);
  const subs = readJson(SUBS_FILE, []);
  const sub = subs.find((s) => s.userId === userId);
  return res.json({ subscription: sub || null });
});

// ---------------- ADMIN LIST (who paid) ----------------
router.get("/admin/list", requireAuth, (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });

  const subs = readJson(SUBS_FILE, []);
  const users = readJson(USERS_FILE, []);

  const rows = subs.map((s) => {
    const u = users.find((x) => String(x.id || x._id) === String(s.userId));
    return {
      userId: s.userId,
      email: u?.email || null,
      name: u?.name || u?.fullName || null,

      status: s.status,
      plan: s.plan,
      periodEndsAt: s.periodEndsAt || null,
      lastPaymentAt: s.lastPaymentAt || null,
      lastPaymentAmount: s.lastPaymentAmount || null,
      lastPaymentCurrency: s.lastPaymentCurrency || null,

      hostedInvoiceUrl: s.hostedInvoiceUrl || null,
      invoicePdf: s.invoicePdf || null,
      receiptUrl: s.receiptUrl || null,
    };
  });

  return res.json({ count: rows.length, rows });
});

export default router;
