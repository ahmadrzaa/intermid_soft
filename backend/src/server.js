/* =========================================================
 * INTERMID Cheque Software API (ESM)
 * =======================================================*/
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Security (relax CSP in dev)
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);

// CORS (multiple origins allowed)
const ORIGINS = (process.env.FRONTEND_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(cors({ origin: ORIGINS, credentials: true }));

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Health
app.get("/", (_req, res) =>
  res.json({
    ok: true,
    service: "intermid-cheque-api",
    mode: process.env.NODE_ENV || "development",
  })
);

// ---- ROUTES ----
let authMounted = false;
try {
  const mod = await import("./routes/auth.js");
  const router = mod.default || mod.router || mod;
  app.use("/api/auth", router);
  console.log("Auth routes loaded");
  authMounted = true;
} catch (e) {
  console.warn("Auth routes NOT loaded:", e.message);
}

let chequesMounted = false;
try {
  const mod = await import("./routes/cheques.js");
  const router = mod.default || mod.router || mod;
  app.use("/api/cheques", router);
  console.log("Cheques routes loaded");
  chequesMounted = true;
} catch (e) {
  console.warn("Cheques routes NOT loaded:", e.message);
}

let beneficiariesMounted = false;
try {
  const mod = await import("./routes/beneficiaries.js");
  const router = mod.default || mod.router || mod;
  app.use("/api/beneficiaries", router);
  console.log("Beneficiaries routes loaded");
  beneficiariesMounted = true;
} catch (e) {
  console.warn("Beneficiaries routes NOT loaded:", e.message);
}

// NEW: AI AGENT ROUTES
let agentMounted = false;
try {
  const mod = await import("./routes/agent.js");
  const router = mod.default || mod.router || mod;
  app.use("/api/agent", router);
  console.log("Agent routes loaded");
  agentMounted = true;
} catch (e) {
  console.warn("Agent routes NOT loaded:", e.message);
}

// 404 + error
app.use((req, res) =>
  res.status(404).json({ ok: false, message: "Not Found" })
);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: "Server error" });
});

// Mongo (optional)
async function initMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("MongoDB: skipped (MONGODB_URI not set).");
    return;
  }
  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.warn(
      "MongoDB connection failed, continuing without DB:",
      err.message
    );
  }
}

const PORT = Number(process.env.PORT || 3001);
await initMongo();

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`CORS allowed origins: ${ORIGINS.join(", ")}`);
  if (!authMounted) console.log("NOTE: /api/auth not mounted");
  if (!chequesMounted) console.log("NOTE: /api/cheques not mounted");
  if (!beneficiariesMounted)
    console.log("NOTE: /api/beneficiaries not mounted");
  if (!agentMounted) console.log("NOTE: /api/agent not mounted");
});
