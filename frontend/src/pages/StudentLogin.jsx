
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import '../styles/Auth.css';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/student/login', formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/student/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <section className="auth-left">
        <div className="auth-brand">College Bus Tracker</div>

        <h1>Your Campus Journey, Made Simpler.</h1>

        <p>
          Track your college bus in real time, stay updated with
          important alerts, and make your daily commute easier.
        </p>

        <div className="auth-features">
          <div className="auth-feature">Live Bus Tracking</div>
          <div className="auth-feature">Instant Alerts</div>
          <div className="auth-feature">Route Details</div>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card">

          <h2>Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to access your student dashboard.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="auth-form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                className="auth-input"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value
                  })
                }
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                className="auth-input"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value
                  })
                }
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

          </form>

          <div className="auth-links">
            <p>
              Don't have an account?{' '}
              <Link to="/student/register">Create Account</Link>
            </p>

            <Link to="/">← Back to Home</Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default StudentLogin;
