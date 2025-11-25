// frontend/src/services/auth.js
import api from "./api.js";

export const login = ({ email, password }) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const register = (payload) =>
  api.post("/api/auth/register", payload).then((r) => r.data);

export const me = () => api.get("/api/auth/me").then((r) => r.data);

export const logout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
