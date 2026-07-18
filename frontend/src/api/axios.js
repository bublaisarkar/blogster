import axios from 'axios';

// ✅ Get the backend URL (without the `/api` suffix for images)
const BACKEND_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_BASE}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor (unchanged)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ NEW: Response interceptor to sanitize blog content
api.interceptors.response.use(
  (response) => {
    // Helper to recursively sanitize any "content" fields
    const sanitizeContent = (obj) => {
      if (!obj) return obj;
      if (Array.isArray(obj)) {
        return obj.map(sanitizeContent);
      }
      if (typeof obj === 'object') {
        // If this object has a 'content' property that is a string, sanitize it
        if (obj.content && typeof obj.content === 'string') {
          obj.content = obj.content.replace(/http:\/\/localhost:5000/g, BACKEND_BASE);
        }
        // Recurse into nested objects
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            obj[key] = sanitizeContent(obj[key]);
          }
        }
        return obj;
      }
      return obj;
    };

    // Sanitize the entire response data
    response.data = sanitizeContent(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;