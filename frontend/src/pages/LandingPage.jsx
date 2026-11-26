
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">

      <nav className="landing-navbar">
        <div className="landing-brand">Campus Bus Tracker</div>
        <Link to="/student/login" className="landing-nav-link">
          Student Login
        </Link>
      </nav>

      <section className="landing-hero">
        <span className="landing-tag">
          Smart Campus Transportation
        </span>

        <h1>
          Your Campus Journey,<br />
          Made Simpler.
        </h1>

        <p>
          Track college buses in real time, stay updated with
          notifications, and make your daily campus commute easier.
        </p>
      </section>

      <section className="landing-roles">

        <div className="landing-role-card">
          <span className="landing-role-number">01 / STUDENT PORTAL</span>
          <h2>Student / Faculty</h2>
          <p>
            Track buses, view live locations, and receive
            real-time transportation updates.
          </p>

          <div className="landing-actions">
            <Link to="/student/login" className="landing-btn landing-btn-primary">
              Sign In
            </Link>

            <Link to="/student/register" className="landing-btn landing-btn-secondary">
              Register
            </Link>
          </div>
        </div>

        <div className="landing-role-card">
          <span className="landing-role-number">02 / DRIVER PORTAL</span>
          <h2>Bus Driver</h2>
          <p>
            Share your live location, manage your availability,
            and keep students informed.
          </p>

          <div className="landing-actions">
            <Link to="/driver/login" className="landing-btn landing-btn-primary">
              Driver Login
            </Link>
          </div>
        </div>

        <div className="landing-role-card">
          <span className="landing-role-number">03 / ADMIN PORTAL</span>
          <h2>Administrator</h2>
          <p>
            Manage buses, drivers, routes, and monitor
            campus transportation operations.
          </p>

          <div className="landing-actions">
            <Link to="/admin/login" className="landing-btn landing-btn-primary">
              Admin Login
            </Link>
          </div>
        </div>

      </section>

      <section className="landing-features">
        <h2>Everything You Need</h2>
        <p>Designed to make campus transportation more convenient.</p>

        <div className="landing-feature-list">
          <div className="landing-feature-item">Real-Time Bus Tracking</div>
          <div className="landing-feature-item">Live Location Updates</div>
          <div className="landing-feature-item">Mobile Responsive</div>
          <div className="landing-feature-item">Smart Notifications</div>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} Campus Bus Tracker. All rights reserved.
      </footer>

    </div>
  );
};

export default LandingPage;
