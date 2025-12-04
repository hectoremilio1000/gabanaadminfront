// src/api/client.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Interceptor para inyectar el token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gabana_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
