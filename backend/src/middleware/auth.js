import jwt from "jsonwebtoken";

const getSecret = () => {
  const s = process.env.JWT_SECRET;

  // ✅ Allow dev fallback so local runs don't break if env missing
  if (!s) {
    if (process.env.NODE_ENV !== "production") {
      return "DEV_ONLY_CHANGE_ME_JWT_SECRET";
    }
    throw new Error("JWT_SECRET is not set");
  }
  return s;
};

function extractToken(req) {
  // 1) Authorization header
  const auth = req.headers.authorization || "";
  if (auth) {
    const parts = auth.split(" ");
    // "Bearer token"
    if (parts.length === 2 && /^bearer$/i.test(parts[0]) && parts[1]) {
      return parts[1].trim();
    }
    // "token" (no bearer)
    if (parts.length === 1 && parts[0]) {
      return parts[0].trim();
    }
  }

  // 2) x-auth-token header (common in apps)
  const x = req.headers["x-auth-token"];
  if (x && typeof x === "string" && x.trim()) return x.trim();

  // 3) query token (optional – useful for debugging)
  const q = req.query?.token;
  if (q && typeof q === "string" && q.trim()) return q.trim();

  return null;
}

export function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Missing token" });

    req.user = jwt.verify(token, getSecret());
    next();
  } catch (_e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function optionalAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (token) req.user = jwt.verify(token, getSecret());
  } catch (_e) {}
  next();
}

export function signToken(payload, opts = {}) {
  return jwt.sign(payload, getSecret(), { expiresIn: "12h", ...opts });
}

export default { requireAuth, optionalAuth, signToken };
