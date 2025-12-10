// frontend/src/services/api.js
import axios from "axios";

// Use Render backend in production (set on Render as VITE_API_URL),
// fallback to local dev server when running locally.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Exported so other places (like cheque_bbk iframe) can use the same backend root
export const API_ROOT = baseURL;

const api = axios.create({
  baseURL,
  withCredentials: false, // we're using Bearer tokens, not cookies
});

// Attach token on every request
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

// Global 401 handler (optional)
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
