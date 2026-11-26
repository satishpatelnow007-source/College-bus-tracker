
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import '../styles/Auth.css';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/admin/login', { password });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/admin/dashboard');
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

        <h1>Manage Your Campus Transport.</h1>

        <p>
          Access the administration portal to manage drivers,
          routes, buses, and monitor campus transportation.
        </p>

        <div className="auth-features">
          <div className="auth-feature">Driver Management</div>
          <div className="auth-feature">Route Management</div>
          <div className="auth-feature">Live Monitoring</div>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card">

          <h2>Admin Login</h2>
          <p className="auth-subtitle">
            Sign in securely to access the admin dashboard.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="auth-form-group">
              <label htmlFor="admin-password">Admin Password</label>

              <input
                id="admin-password"
                className="auth-input"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>

          </form>

          <div className="auth-links">
            <Link to="/">← Back to Home</Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default AdminLogin;
