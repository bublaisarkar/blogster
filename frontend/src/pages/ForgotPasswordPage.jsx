// pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post('/auth/forgot-password', { email });
      if (data.success) {
        setIsSent(true);
        toast.success('Password reset email sent!');
      } else {
        toast.error(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-[#edebf5] p-6 sm:p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-2xl font-bold text-[#1e1e2a] hover:text-indigo-600 transition">
            <i className="fas fa-pen-fancy text-indigo-600 mr-2"></i> Blogster
          </Link>
          <h1 className="text-2xl font-bold text-[#14141f] mt-4">Reset Password</h1>
          <p className="text-[#6b6b84] text-sm mt-2">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {isSent ? (
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-[#14141f]">Check your email</h2>
            <p className="text-[#6b6b84] text-sm mt-2">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login" className="block mt-6 text-indigo-600 hover:text-indigo-800 font-medium">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>Send Reset Link</>
              )}
            </button>

            <p className="text-center text-sm text-[#6b6b84]">
              Remember your password?
              <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium ml-1">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;