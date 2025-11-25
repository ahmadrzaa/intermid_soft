import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const r = Router();

function toSafeUser(u) {
  if (!u) return null;
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    mobile: u.mobile,
    company: u.company,
  };
}

// REGISTER -------------------------------------------------
r.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      company,
      role = "Staff",
      password,
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cleanEmail = email.trim().toLowerCase();

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res
        .status(409)
        .json({ message: "Email already registered" });
    }

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

    return res
      .status(201)
      .json({ token, user: toSafeUser(user) });
  } catch (e) {
    return res
      .status(500)
      .json({ message: e.message || "Register failed" });
  }
});

// LOGIN ----------------------------------------------------
r.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email & password required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If frontend sends a role (Admin / Manager / Staff), enforce match
    if (role && role !== user.role) {
      return res.status(403).json({
        message: `You are registered as ${user.role}, not ${role}.`,
      });
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.json({
      token,
      user: toSafeUser(user),
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: e.message || "Login failed" });
  }
});

// ME -------------------------------------------------------
r.get("/me", requireAuth, async (req, res) => {
  const u = await User.findById(req.user.id).lean();
  if (!u) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(toSafeUser(u));
});

export default r;
