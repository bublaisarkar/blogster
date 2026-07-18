import axios from 'axios';

// ✅ Get the backend URL (without the `/api` suffix for images)
const BACKEND_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_BASE}/api`;

// ✅ Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ✅ Add token interceptor (unchanged)
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

// ✅ CRITICAL FIX: Response interceptor to replace localhost with Render URL
api.interceptors.response.use(
  (response) => {
    // Helper to recursively sanitize ANY string that contains localhost:5000
    const sanitizeData = (obj) => {
      if (!obj) return obj;
      
      // If it's a string, replace the localhost URL
      if (typeof obj === 'string') {
        return obj.replace(/http:\/\/localhost:5000/g, BACKEND_BASE);
      }
      
      // If it's an array, sanitize each item
      if (Array.isArray(obj)) {
        return obj.map(sanitizeData);
      }
      
      // If it's an object, sanitize every value
      if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = sanitizeData(obj[key]);
          }
        }
        return newObj;
      }
      
      return obj;
    };

    // Apply the sanitization to the entire response data
    response.data = sanitizeData(response.data);
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