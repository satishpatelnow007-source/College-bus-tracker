import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import DriverLogin from './pages/DriverLogin';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<div style={{padding: '20px', textAlign: 'center'}}><h2>Page Not Found</h2><a href="/">Go Home</a></div>} />
      </Routes>
    </Router>
  );
}

export default App;