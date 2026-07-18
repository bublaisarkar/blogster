import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// ✅ Remove toast import
// import toast from "react-hot-toast";
import AuthContext from "./AuthContext";
import authService from "../services/authService";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Initialize auth - Called once on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          authService.setToken(storedToken);
          const userData = await authService.fetchUser();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth initialization error:', error);
          authService.logout();
          setUser(null);
          setToken(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ Register - NO TOAST
  const register = async (userData) => {
    setError(null);
    try {
      const result = await authService.register(userData);
      const { token: newToken, user: newUser } = result;
      authService.setToken(newToken);
      setToken(newToken);
      setUser(newUser);
      // ✅ NO toast here - let component handle it
      return { success: true, user: newUser };
    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      // ✅ NO toast here - let component handle it
      return { success: false, error: message };
    }
  };

  // ✅ Login - NO TOAST
  const login = async (email, password) => {
    setError(null);
    try {
      const result = await authService.login(email, password);
      const { token: newToken, user: newUser } = result;
      authService.setToken(newToken);
      setToken(newToken);
      setUser(newUser);
      // ✅ NO toast here - let component handle it
      return { success: true, user: newUser };
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      // ✅ NO toast here - let component handle it
      return { success: false, error: message };
    }
  };

  // ✅ Logout - NO TOAST
  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    // ✅ NO toast here - let component handle it
    navigate('/login');
  }, [navigate]);

  // ✅ Update Profile - NO TOAST
  const updateProfile = useCallback(async (data) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser
      }));
      return { 
        success: true, 
        user: updatedUser,
        message: 'Profile updated successfully!' 
      };
    } catch (err) {
      const message = err.message || 'Failed to update profile';
      setError(message);
      // ✅ NO toast here - let component handle it
      return { 
        success: false, 
        error: message,
        message: message
      };
    }
  }, []);

  // ✅ Update Password - NO TOAST
  const updatePassword = useCallback(async (passwordData) => {
    try {
      await authService.updatePassword(passwordData);
      return { 
        success: true, 
        message: 'Password updated successfully!' 
      };
    } catch (err) {
      const message = err.message || 'Failed to update password';
      setError(message);
      // ✅ NO toast here - let component handle it
      return { 
        success: false, 
        error: message,
        message: message
      };
    }
  }, []);

  // ✅ Create the context value
  const value = {
    user,
    setUser,
    loading,
    token,
    setToken,
    error,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isAuthor: user?.role === 'author' || user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;