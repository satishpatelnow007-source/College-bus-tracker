
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import '../styles/Auth.css';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/student/register', formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/student/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <section className="auth-left">
        <div className="auth-brand">College Bus Tracker</div>

        <h1>Start Your Journey With Us.</h1>

        <p>
          Create your account to access live bus tracking,
          route information, and important campus travel updates.
        </p>

        <div className="auth-features">
          <div className="auth-feature">Live Bus Tracking</div>
          <div className="auth-feature">Instant Alerts</div>
          <div className="auth-feature">Easy Access</div>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card">

          <h2>Create Account</h2>
          <p className="auth-subtitle">
            Register to get started with College Bus Tracker.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="auth-form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                className="auth-input"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                className="auth-input"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="role">Register As</label>
              <select
                id="role"
                className="auth-input"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div className="auth-form-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                className="auth-input"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                autoComplete="new-password"
                required
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                className="auth-input"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value
                  })
                }
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

          </form>

          <div className="auth-links">
            <p>
              Already have an account?{' '}
              <Link to="/student/login">Sign In</Link>
            </p>

            <Link to="/">← Back to Home</Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default StudentRegister;
