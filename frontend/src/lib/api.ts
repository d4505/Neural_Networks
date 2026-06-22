import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp("(^| )auth_token=([^;]+)"));
      if (match) {
        config.headers.Authorization = `Bearer ${match[2]}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
