import { Router } from "express";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const r = Router();

// ---- File-store plumbing (used only when no MongoDB URI) ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_DB = path.join(__dirname, "..", "data", "users.json");
fs.mkdirSync(path.dirname(USERS_DB), { recursive: true });
if (!fs.existsSync(USERS_DB)) fs.writeFileSync(USERS_DB, "[]", "utf8");

const readUsers = () => JSON.parse(fs.readFileSync(USERS_DB, "utf8"));
const writeUsers = (arr) =>
  fs.writeFileSync(USERS_DB, JSON.stringify(arr, null, 2), "utf8");

const usingFileStore = !process.env.MONGODB_URI; // demo mode if no DB

function toSafeUser(u) {
  if (!u) return null;
  return {
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    mobile: u.mobile || "",
    company: u.company || "",
  };
}

// REGISTER -------------------------------------------------
r.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, company, role = "Staff", password } =
      req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    if (usingFileStore) {
      const all = readUsers();
      if (all.find((u) => u.email === cleanEmail)) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = {
        id: Date.now().toString(36),
        name: name.trim(),
        email: cleanEmail,
        mobile: mobile ? String(mobile).trim() : "",
        company: company ? String(company).trim() : "",
        role,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      all.push(user);
      writeUsers(all);

      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });
      return res.status(201).json({ token, user: toSafeUser(user) });
    }

    // --- MongoDB path ---
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      mobile: mobile ? String(mobile).trim() : "",
      company: company ? String(company).trim() : "",
      role,
      passwordHash,
    });

    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    return res.status(201).json({ token, user: toSafeUser(user) });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Register failed" });
  }
});

// LOGIN ----------------------------------------------------
r.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    let user;
    if (usingFileStore) {
      user = readUsers().find((u) => u.email === cleanEmail);
    } else {
      user = await User.findOne({ email: cleanEmail });
    }
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (role && role !== user.role) {
      return res
        .status(403)
        .json({ message: `You are registered as ${user.role}, not ${role}.` });
    }

    const token = signToken({
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    return res.json({ token, user: toSafeUser(user) });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Login failed" });
  }
});

// ME -------------------------------------------------------
r.get("/me", requireAuth, async (req, res) => {
  try {
    if (usingFileStore) {
      const u = readUsers().find((x) => x.id === req.user.id);
      if (!u) return res.status(404).json({ message: "User not found" });
      return res.json(toSafeUser(u));
    }
    const u = await User.findById(req.user.id).lean();
    if (!u) return res.status(404).json({ message: "User not found" });
    return res.json(toSafeUser(u));
  } catch (e) {
    return res.status(500).json({ message: "Profile error" });
  }
});

export default r;
