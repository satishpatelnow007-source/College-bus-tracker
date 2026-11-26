
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import '../styles/Auth.css';

const DriverLogin = () => {
  const [formData, setFormData] = useState({
    driverId: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.driverId.trim() || !formData.password) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/driver/login', {
        driverId: formData.driverId,
        password: formData.password,
        location: null
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...response.data.driver,
          role: 'driver'
        })
      );

      window.location.href = '/driver/dashboard';
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

        <h1>Drive Safe. Stay Connected.</h1>

        <p>
          Access your driver portal to share your live location
          and help students track their college bus in real time.
        </p>

        <div className="auth-features">
          <div className="auth-feature">Live Location Sharing</div>
          <div className="auth-feature">Route Information</div>
          <div className="auth-feature">Easy Dashboard</div>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card">

          <h2>Driver Login</h2>
          <p className="auth-subtitle">
            Sign in to access your driver dashboard.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="auth-form-group">
              <label htmlFor="driverId">Driver ID</label>

              <input
                id="driverId"
                className="auth-input"
                type="text"
                placeholder="Enter your Driver ID"
                value={formData.driverId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    driverId: e.target.value.toUpperCase()
                  })
                }
                autoComplete="username"
                required
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="driver-password">Password</label>

              <input
                id="driver-password"
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
              {loading ? 'Signing In...' : 'Sign In & Go Online'}
            </button>

          </form>

          <div className="auth-links">
            <p>
              Don't have an account? Contact your administrator
              to get registered.
            </p>

            <Link to="/">← Back to Home</Link>
          </div>

          <div className="auth-notice">
            <strong>Registration Notice</strong>
            <p>
              Only registered drivers can access this portal.
              Contact your administrator for registration.
            </p>
          </div>

          <div className="auth-info">
            <strong>Location Sharing</strong>
            <p>
              After login, allow location access to enable
              real-time bus tracking.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default DriverLogin;
