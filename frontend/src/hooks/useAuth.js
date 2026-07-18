import { useContext, useCallback } from "react";
import AuthContext from "../context/AuthContext";
import axios from "../api/axios";

const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // ✅ Only destructure what you actually use
  const { setUser, logout } = context;

  // ✅ Update profile with proper error handling
  const updateProfile = useCallback(async (userData) => {
    try {
      // ✅ Only send updatable fields
      const { data } = await axios.put('/auth/profile', userData);
      
      // ✅ Update user state if user data is returned
      if (data.success && data.user) {
        setUser(prevUser => ({
          ...prevUser,
          ...data.user
        }));
        return { success: true, user: data.user };
      }
      
      // ✅ If no user data returned but success is true
      if (data.success) {
        // Merge the updated data with existing user
        setUser(prevUser => ({
          ...prevUser,
          ...userData
        }));
        return { success: true };
      }
      
      // ❌ If success is false, return error without logging out
      return { 
        success: false, 
        message: data.message || 'Failed to update profile' 
      };
    } catch (error) {
      // ✅ NEVER call logout here for profile updates
      console.error('Profile update error:', error);
      
      // ✅ Only logout if it's a genuine authentication error
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || '';
        // Only logout if token is explicitly invalid or expired
        if (message.includes('invalid token') || 
            message.includes('expired') || 
            message.includes('unauthorized')) {
          // ✅ Call logout only for auth errors
          logout();
          return { 
            success: false, 
            message: 'Session expired. Please login again.' 
          };
        }
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  }, [setUser, logout]);

  // ✅ Update password with proper error handling
  const updatePassword = useCallback(async (passwordData) => {
    try {
      const { data } = await axios.put('/auth/password', passwordData);
      
      if (data.success) {
        return { success: true, message: 'Password updated successfully' };
      }
      
      return { 
        success: false, 
        message: data.message || 'Failed to update password' 
      };
    } catch (error) {
      // ✅ Never logout on password update errors
      console.error('Password update error:', error);
      
      // ✅ Only logout for auth errors
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || '';
        if (message.includes('invalid token') || 
            message.includes('expired') || 
            message.includes('unauthorized')) {
          logout();
          return { 
            success: false, 
            message: 'Session expired. Please login again.' 
          };
        }
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update password' 
      };
    }
  }, [logout]);

  // ✅ Update avatar with proper error handling
  const updateAvatar = useCallback(async (formData) => {
    try {
      const { data } = await axios.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (data.success && data.data?.avatar) {
        // ✅ Update user state with new avatar
        setUser(prevUser => ({
          ...prevUser,
          avatar: data.data.avatar
        }));
        return { 
          success: true, 
          avatar: data.data.avatar,
          message: 'Avatar updated successfully' 
        };
      }
      
      return { 
        success: false, 
        message: data.message || 'Failed to update avatar' 
      };
    } catch (error) {
      // ✅ Never logout on avatar update errors
      console.error('Avatar update error:', error);
      
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || '';
        if (message.includes('invalid token') || 
            message.includes('expired') || 
            message.includes('unauthorized')) {
          logout();
          return { 
            success: false, 
            message: 'Session expired. Please login again.' 
          };
        }
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update avatar' 
      };
    }
  }, [setUser, logout]);

  // ✅ Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await axios.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: 'Failed to refresh user data' };
    } catch (error) {
      console.error('Refresh user error:', error);
      // ✅ Only logout on auth errors
      if (error.response?.status === 401) {
        logout();
        return { success: false, message: 'Session expired' };
      }
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to refresh user' 
      };
    }
  }, [setUser, logout]);

  // ✅ Return enhanced context with new methods
  return {
    ...context, // Spread original context values (user, token, login, logout, etc.)
    updateProfile,
    updatePassword,
    updateAvatar,
    refreshUser,
  };
};

export default useAuth;