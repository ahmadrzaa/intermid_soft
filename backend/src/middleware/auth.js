import jwt from "jsonwebtoken";

const getSecret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
};

export function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const [, token] = h.split(" ");
    if (!token) return res.status(401).json({ message: "Missing token" });
    req.user = jwt.verify(token, getSecret());
    next();
  } catch (_e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function optionalAuth(req, _res, next) {
  try {
    const h = req.headers.authorization || "";
    const [, token] = h.split(" ");
    if (token) req.user = jwt.verify(token, getSecret());
  } catch (_e) {}
  next();
}

export function signToken(payload, opts = {}) {
  return jwt.sign(payload, getSecret(), { expiresIn: "12h", ...opts });
}

export default { requireAuth, optionalAuth, signToken };
