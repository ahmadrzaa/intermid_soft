// backend/src/routes/agent.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Use the SAME JSON file store as routes/cheques.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB = path.join(__dirname, "..", "data", "cheques.json");

// Ensure file exists (mirror cheques.js behavior)
fs.mkdirSync(path.dirname(DB), { recursive: true });
if (!fs.existsSync(DB)) fs.writeFileSync(DB, "[]", "utf8");

function readCheques() {
  try {
    const raw = fs.readFileSync(DB, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper: normalize status comparisons
function isStatus(x, ...names) {
  const s = String(x?.status || "").toLowerCase();
  return names.some((n) => s === String(n).toLowerCase());
}

// Build summary stats for agent answers (from JSON data)
function buildStats() {
  const list = readCheques();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const total = list.length;

  // Your app uses "Draft" / "Approved" / "Cancelled".
  // We also gracefully count other names if they appear later.
  const draft = list.filter((c) => isStatus(c, "Draft")).length;
  // Treat "Draft" as "Pending approval" in summaries
  const pending = draft;

  const approved = list.filter((c) => isStatus(c, "Approved")).length;

  const printed = list.filter((c) =>
    isStatus(c, "Printed", "Issued", "Completed")
  ).length;

  const returned = list.filter((c) =>
    isStatus(c, "Returned", "Rejected")
  ).length;

  const stopped = list.filter((c) =>
    isStatus(c, "Stopped", "Cancelled", "Canceled")
  ).length;

  const today = list.filter((c) => {
    const d = new Date(c.createdAt || 0);
    return d >= todayStart && d < tomorrowStart;
  }).length;

  const month = list.filter((c) => {
    const d = new Date(c.createdAt || 0);
    return d >= monthStart && d < monthEnd;
  }).length;

  return {
    total,
    draft,
    pending,
    approved,
    printed,
    returned,
    stopped,
    today,
    month,
  };
}

// MAIN CHAT ROUTE
router.post("/chat", (req, res) => {
  try {
    const { message = "" } = req.body || {};
    const text = String(message || "").toLowerCase();

    const stats = buildStats();

    let reply;

    if (text.includes("today")) {
      reply = `Today you have ${stats.today} cheque(s) created.`;
    } else if (text.includes("pending")) {
      reply = `There are ${stats.pending} cheque(s) pending approval.`;
    } else if (
      text.includes("overall") ||
      text.includes("summary") ||
      text.includes("total")
    ) {
      reply = `Overall cheque summary:
- Total: ${stats.total}
- Draft: ${stats.draft}
- Pending: ${stats.pending}
- Approved: ${stats.approved}
- Printed: ${stats.printed}
- Returned: ${stats.returned}
- Stopped: ${stats.stopped}
This month there are ${stats.month} cheque(s) so far.`;
    } else {
      reply = `I can help you with:
- "How many cheques today?"
- "How many are pending approval?"
- "Give me overall cheque summary."`;
    }

    res.json({ ok: true, reply, stats });
  } catch (err) {
    console.error("Agent chat error:", err);
    res.status(500).json({ ok: false, message: "Agent error" });
  }
});

export default router;
