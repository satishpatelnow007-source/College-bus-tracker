import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'student'
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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📝</div>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Student Registration</h2>
          <p style={{ color: '#666' }}>Create your account to track buses</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Full Name"
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
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
              placeholder="Email Address"
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
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
              placeholder="Password"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Confirm Password"
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Already have an account? <Link to="/student/login" style={{ color: '#3b82f6' }}>Sign in here</Link>
          </p>
          <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;