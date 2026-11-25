import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

const DriverLogin = () => {
  const [formData, setFormData] = useState({
    driverId: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.driverId && formData.password) {
      try {
        const response = await api.post('/auth/driver/login', {
          driverId: formData.driverId,
          password: formData.password,
          location: null
        });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({...response.data.driver, role: 'driver'}));
        window.location.href = '/driver/dashboard';
      } catch (error) {
        alert(error.response?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <Link to="/" style={{ color: '#10b981', textDecoration: 'none', marginBottom: '20px', display: 'block' }}>
          ← Back to Home
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚌</div>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Driver Login</h2>
          <p style={{ color: '#666' }}>Sign in to start sharing your location</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Driver ID</label>
            <input
              type="text"
              value={formData.driverId}
              onChange={(e) => setFormData({...formData, driverId: e.target.value.toUpperCase()})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '5px',
                fontSize: '16px',
                textTransform: 'uppercase'
              }}
              placeholder="Enter your driver ID (e.g., DRV001)"
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
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              background: '#10b981',
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Sign In & Go Online
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Don't have an account? Contact your administrator to get registered.
          </p>
        </div>

        <div style={{ 
          background: '#fef3c7', 
          padding: '15px', 
          borderRadius: '5px', 
          marginTop: '20px',
          border: '1px solid #f59e0b'
        }}>
          <strong>Note:</strong> Only registered drivers can access this portal. Contact admin for registration.
        </div>

        <div style={{ 
          background: '#dbeafe', 
          padding: '15px', 
          borderRadius: '5px', 
          marginTop: '10px',
          border: '1px solid #3b82f6'
        }}>
          <strong>📍 Location Sharing:</strong> After login, you'll be asked to share your location for real-time tracking.
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;