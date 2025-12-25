// frontend/src/services/api.js
import axios from "axios";

// Prefer env var if present, fallback to localhost for dev
const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL,
});

// Attach token (if any)
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

export default api;
