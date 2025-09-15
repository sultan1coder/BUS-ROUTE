import axios from "axios";

const API_BASE_URL = __DEV__
  ? "http://10.0.2.2:3000/api" // Android emulator
  : "https://your-production-api.com/api"; // Production URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

export default api;
