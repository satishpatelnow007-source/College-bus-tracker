
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../utils/api';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await authAPI.forgotPassword(email.trim());

      setEmailSent(true);
      toast.success('Password reset instructions sent to your email!');
    } catch (error) {
      console.error('Forgot password error:', error);

      const errorMessage =
        error.response?.data?.message ||
        'Failed to send reset email. Please try again.';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <section className="auth-left">
        <div className="auth-brand">College Bus Tracker</div>

        <h1>Account Security Matters.</h1>

        <p>
          Recover access to your account securely.
          Follow the password recovery instructions
          to get back to your dashboard.
        </p>

        <div className="auth-features">
          <div className="auth-feature">Secure Access</div>
          <div className="auth-feature">Account Recovery</div>
          <div className="auth-feature">Easy Support</div>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card auth-card-wide">

          {emailSent ? (
            <>
              <div className="auth-icon">
                <CheckCircle size={32} />
              </div>

              <h2>Check Your Email</h2>

              <p className="auth-subtitle">
                Password reset instructions have been requested for:
                <strong> {email}</strong>
              </p>

              <div className="auth-notice-success">
                Please check your inbox and spam folder for further
                instructions.
              </div>

              <button
                type="button"
                className="auth-button"
                onClick={() => setEmailSent(false)}
              >
                Try Different Email
              </button>

              <div className="auth-links">
                <Link to="/student/login">Back to Login</Link>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/student/login"
                className="auth-back-link"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>

              <div className="auth-icon">
                <Mail size={30} />
              </div>

              <h2>Forgot Password?</h2>

              <p className="auth-subtitle">
                Enter your registered email address to request
                password reset instructions.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="auth-form-group">
                  <label htmlFor="forgot-email">
                    Email Address
                  </label>

                  <input
                    id="forgot-email"
                    className="auth-input"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Sending Instructions...'
                    : 'Send Reset Instructions'}
                </button>
              </form>

              <div className="auth-links">
                Remember your password?{' '}
                <Link to="/student/login">Sign In</Link>
              </div>

              <div className="auth-help-text">
                <strong>Need Help?</strong>
                <p>
                  If you are having trouble recovering your account,
                  contact your college IT support team or administration office.
                </p>
              </div>
            </>
          )}

        </div>
      </section>

    </div>
  );
};

export default ForgotPassword;
