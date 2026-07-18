import axios from 'axios';

// ✅ Get the backend URL (without `/api` suffix for images)
const BACKEND_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_BASE}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor (adds token)
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

// ✅ Response interceptor – FIXES BOTH CASES
api.interceptors.response.use(
  (response) => {
    const sanitizeData = (obj) => {
      if (!obj) return obj;

      if (typeof obj === 'string') {
        let result = obj;

        // 1. Replace localhost (dev) with your actual backend URL
        result = result.replace(/http:\/\/localhost:5000/g, BACKEND_BASE);

        // 2. 🔥 Force HTTPS for your Render domain (production)
        //    Dynamically extracts domain from BACKEND_BASE (e.g. blogster-ocvb.onrender.com)
        const renderDomain = BACKEND_BASE.replace(/^https?:\/\//, '');
        result = result.replace(
          new RegExp(`http://${renderDomain}`, 'g'),
          `https://${renderDomain}`
        );

        return result;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeData);
      }

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