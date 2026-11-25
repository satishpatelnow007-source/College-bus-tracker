// Forgot password page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import gsap from 'gsap';
import { authAPI } from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Animation for form elements
    gsap.fromTo('.fade-in', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email
      if (!email) {
        toast.error('Email is required');
        setLoading(false);
        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Call forgot password API
      await authAPI.forgotPassword(email);
      
      setEmailSent(true);
      toast.success('Password reset instructions sent to your email!');
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card text-center fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setEmailSent(false)}
                className="btn btn-outline w-full"
              >
                Try Different Email
              </button>
              <Link
                to="/student/login"
                className="btn btn-primary w-full"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          to="/student/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 fade-in"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Forgot Password Form */}
        <div className="card fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
            <p className="text-gray-600 mt-2">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group fade-in">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your registered email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full fade-in"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="spinner"></div>
                  Sending Instructions...
                </div>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>

          <div className="mt-6 text-center fade-in">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/student/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg fade-in">
          <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700">
            If you're having trouble resetting your password, please contact the IT support team 
            or visit the college administration office.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;