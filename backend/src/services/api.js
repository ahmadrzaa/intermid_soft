// frontend/src/services/api.js
import axios from "axios";

// Support BOTH names to avoid breaking (VITE_API_BASE or VITE_API_URL)
let baseURL =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

// Normalize: remove trailing slashes and avoid /api/api double
baseURL = String(baseURL).trim().replace(/\/+$/, "");
baseURL = baseURL.replace(/\/api$/, ""); // if someone sets base as .../api, remove it

const api = axios.create({ baseURL });

// Attach token (if any)
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

export default api;
