// backend/src/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth, signToken } from "../middleware/auth.js";

const r = Router();

// ---------- file store paths ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// ensure file exists and is valid JSON
function ensureUsersFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");
}
function readUsersSafe() {
  ensureUsersFile();
  try {
    const txt = fs.readFileSync(USERS_FILE, "utf8").trim();
    if (!txt) return [];
    return JSON.parse(txt);
  } catch {
    fs.writeFileSync(USERS_FILE, "[]", "utf8");
    return [];
  }
}
function writeUsersSafe(arr) {
  const tmp = USERS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(arr, null, 2), "utf8");
  fs.renameSync(tmp, USERS_FILE);
}

function toSafeUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

// ---------------- REGISTER ----------------
r.post("/register", async (req, res) => {
  try {
    const {
      name = "",
      email = "",
      mobile = "",
      company = "",
      role = "Staff",
      password = "",
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const users = readUsersSafe();

    if (users.some((u) => u.email === cleanEmail)) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(36),
      name: String(name).trim(),
      email: cleanEmail,
      mobile: String(mobile || "").trim(),
      company: String(company || "").trim(),
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsersSafe(users);

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.status(201).json({ token, user: toSafeUser(user) });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Register failed" });
  }
});

// ---------------- LOGIN ----------------
r.post("/login", async (req, res) => {
  try {
    const { email = "", password = "" } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const users = readUsersSafe();
    const user = users.find((u) => u.email === cleanEmail);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // IMPORTANT: no role enforcement here (pill on UI won't block login)

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.json({ token, user: toSafeUser(user) });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Login failed" });
  }
});

// ---------------- ME ----------------
r.get("/me", requireAuth, async (req, res) => {
  const u = readUsersSafe().find((x) => x.id === req.user.id);
  if (!u) return res.status(404).json({ message: "User not found" });
  return res.json(toSafeUser(u));
});

export default r;
