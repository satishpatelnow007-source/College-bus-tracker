import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

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
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>💼</div>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Admin Login</h2>
          <p style={{ color: '#666' }}>Enter admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter admin password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#8b5cf6',
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
          <a href="/" style={{ color: '#8b5cf6', textDecoration: 'none' }}>← Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;