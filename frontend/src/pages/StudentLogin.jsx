import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

const StudentLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '40px', 
        borderRadius: '15px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>👨🎓</div>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Student Login</h2>
          <p style={{ color: '#666' }}>Access your bus tracking dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#3b82f6',
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Don't have an account? <Link to="/student/register" style={{ color: '#3b82f6' }}>Register here</Link>
          </p>
          <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;