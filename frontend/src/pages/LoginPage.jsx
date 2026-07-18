import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error, user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ✅ Pass rememberMe flag to login function
    const result = await login(formData.email, formData.password, formData.rememberMe);
    
    if (result.success) {
      toast.success('Login successful!');
      if (result.user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } else {
      toast.error(result.error || 'Login failed. Please check your credentials.');
    }
  };

  // ✅ If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      {/* Logo Header */}
      <div className="flex justify-center pt-6 sm:pt-8 pb-2">
        <Link to="/" className="flex items-center space-x-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#1e1e2a] hover:text-indigo-600 transition">
          <i className="fas fa-pen-fancy text-indigo-600"></i>
          <span>Blogster</span>
        </Link>
      </div>

      {/* Login Section */}
      <div className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-lg border border-[#edebf5] p-6 sm:p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                <i className="fas fa-user-circle text-indigo-600 text-3xl"></i>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#14141f]">Welcome back</h1>
              <p className="text-[#6b6b84] mt-2 text-sm">Sign in to continue reading and writing</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
                  <i className="fas fa-envelope mr-2 text-indigo-500"></i> Email Address
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com" 
                  className="w-full px-4 py-3 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
                  <i className="fas fa-lock mr-2 text-indigo-500"></i> Password
                </label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                  required
                  disabled={loading}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-[#2d2d3f] cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-[#e6e6ed] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition" 
                    disabled={loading}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 transition font-medium">
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i> Sign In
                  </>
                )}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-[#6b6b84] mt-4">
                Don't have an account? 
                <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-medium transition ml-1">
                  Sign up free
                </Link>
              </p>
            </form>
          </div>

          {/* Back to site link */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-[#6b6b84] hover:text-indigo-600 transition">
              <i className="fas fa-arrow-left mr-1"></i> Back to Blogster
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;