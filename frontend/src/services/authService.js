import api from '../api/axios';

const authService = {
  // ✅ Register user
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (!data.success) {
      throw new Error(data.message);
    }
    return data;
  },

  // ✅ Login user
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (!data.success) {
      throw new Error(data.message);
    }
    return data;
  },

  // ✅ Get current user
  fetchUser: async () => {
    const { data } = await api.get('/auth/me');
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.user;
  },

  // ✅ Update profile
  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.user;
  },

  // ✅ Update password
  updatePassword: async (passwordData) => {
    const { data } = await api.put('/auth/password', passwordData);
    if (!data.success) {
      throw new Error(data.message);
    }
    return data;
  },

  // ✅ Update avatar
  updateAvatar: async (formData) => {
    const { data } = await api.post('/auth/avatar', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    });
    if (!data.success) {
      throw new Error(data.message);
    }
    return data;
  },

  // ✅ Update social links
  updateSocialLinks: async (socialLinks) => {
    const { data } = await api.put('/auth/social-links', socialLinks);
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.user;
  },

  // ✅ Logout (client-side only - clears token)
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },

  // ✅ Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // ✅ Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // ✅ Set token in headers
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // ✅ Refresh user data
  refreshUser: async () => {
    const { data } = await api.get('/auth/me');
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.user;
  }
};

export default authService;