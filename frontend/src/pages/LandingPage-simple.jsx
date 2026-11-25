import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#3b82f6' }}>College Bus Tracker</h1>
        <p>Track your college buses in real-time</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Student/Faculty Login */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3>Student / Faculty</h3>
          <p>Track buses, view routes, and get real-time updates</p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/student/login" style={{ display: 'inline-block', background: '#3b82f6', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px', margin: '5px' }}>
              Sign In
            </Link>
            <Link to="/student/register" style={{ display: 'inline-block', background: 'transparent', color: '#3b82f6', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px', border: '2px solid #3b82f6', margin: '5px' }}>
              Register
            </Link>
          </div>
        </div>

        {/* Driver Login */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3>Bus Driver</h3>
          <p>Share your location and manage bus status</p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/driver/login" style={{ display: 'inline-block', background: '#10b981', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px' }}>
              Driver Login
            </Link>
          </div>
        </div>

        {/* Admin Login */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3>Administrator</h3>
          <p>Manage buses, drivers, routes, and users</p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/admin/login" style={{ display: 'inline-block', background: '#6b7280', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px' }}>
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;