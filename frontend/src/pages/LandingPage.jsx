import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '40px' }}>
        College Bus Tracker
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{ 
          background: '#f0f9ff', 
          padding: '30px', 
          borderRadius: '10px', 
          textAlign: 'center',
          border: '2px solid #3b82f6'
        }}>
          <h2>👨🎓 Student / Faculty</h2>
          <p>Track buses and get real-time updates</p>
          <Link 
            to="/student/login" 
            style={{ 
              background: '#3b82f6', 
              color: 'white', 
              padding: '10px 20px', 
              borderRadius: '5px', 
              textDecoration: 'none',
              display: 'inline-block',
              margin: '5px'
            }}
          >
            Sign In
          </Link>
          <Link 
            to="/student/register" 
            style={{ 
              background: 'white', 
              color: '#3b82f6', 
              padding: '10px 20px', 
              borderRadius: '5px', 
              textDecoration: 'none',
              display: 'inline-block',
              margin: '5px',
              border: '2px solid #3b82f6'
            }}
          >
            Register
          </Link>
        </div>

        <div style={{ 
          background: '#f0fdf4', 
          padding: '30px', 
          borderRadius: '10px', 
          textAlign: 'center',
          border: '2px solid #10b981'
        }}>
          <h2>🚌 Bus Driver</h2>
          <p>Share your location and manage status</p>
          <Link 
            to="/driver/login" 
            style={{ 
              background: '#10b981', 
              color: 'white', 
              padding: '10px 20px', 
              borderRadius: '5px', 
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Driver Login
          </Link>
        </div>

        <div style={{ 
          background: '#faf5ff', 
          padding: '30px', 
          borderRadius: '10px', 
          textAlign: 'center',
          border: '2px solid #8b5cf6'
        }}>
          <h2>💼 Administrator</h2>
          <p>Manage buses, drivers, and routes</p>
          <Link 
            to="/admin/login" 
            style={{ 
              background: '#8b5cf6', 
              color: 'white', 
              padding: '10px 20px', 
              borderRadius: '5px', 
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Admin Login
          </Link>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '60px', color: '#666' }}>
        <h3>✨ Features</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginTop: '20px' }}>
          <div>📍 Real-Time Tracking</div>
          <div>📱 Mobile Friendly</div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;