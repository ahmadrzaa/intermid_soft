// frontend/src/services/auth.js
import api from "./api.js";

// Login
// payload: { email, password, remember, role }
export const login = (payload) =>
  api.post("/api/auth/login", payload).then((r) => r.data);

// Register
export const register = (payload) =>
  api.post("/api/auth/register", payload).then((r) => r.data);

// Current user
export const me = () =>
  api.get("/api/auth/me").then((r) => r.data);

// Logout (clear any stored auth)
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("auth:token"); // in case older key was used
  localStorage.removeItem("user");
};
