// frontend/src/services/api.js
import axios from "axios";

// Support BOTH names (VITE_API_BASE or VITE_API_URL) so local + Render never mismatch
let baseURL =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

// Normalize to avoid trailing slashes and /api/api issues
baseURL = String(baseURL).trim().replace(/\/+$/, "");
baseURL = baseURL.replace(/\/api$/, "");

// Export so other places can use same backend root
export const API_ROOT = baseURL;

const api = axios.create({
  baseURL,
  withCredentials: false,
});

// Attach token on every request
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// Global 401 handler
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(err);
  }
);

export default api;
