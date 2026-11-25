// Authentication routes for all user types
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const router = express.Router();

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Student/Faculty Registration
router.post('/student/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'student'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Student/Faculty Login
router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Driver Login
router.post('/driver/login', async (req, res) => {
  try {
    const { driverId, password, location } = req.body;

    // Validate input
    if (!driverId || !password) {
      return res.status(400).json({ message: 'Driver ID and password are required' });
    }

    // Find driver
    const driver = await Driver.findOne({ driverId: driverId.toUpperCase() });
    if (!driver) {
      return res.status(401).json({ message: 'Invalid driver ID or password' });
    }

    // Check if driver is active
    if (!driver.isActive) {
      return res.status(401).json({ message: 'Driver account is deactivated' });
    }

    // Check password
    const isPasswordValid = await driver.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid driver ID or password' });
    }

    // Update driver status to online
    driver.isOnline = true;
    if (location) {
      driver.currentLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date()
      };
    }
    await driver.save();

    // Create driver session for analytics
    const DriverSession = require('../models/DriverSession');
    const session = new DriverSession({
      driverId: driver._id,
      busNumber: driver.busNumber,
      driverName: driver.name,
      loginTime: new Date(),
      loginLocation: location || null
    });
    await session.save();

    // Generate token
    const token = generateToken(driver._id, 'driver');

    res.json({
      message: 'Login successful',
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        driverId: driver.driverId,
        busNumber: driver.busNumber,
        phone: driver.phone
      }
    });
  } catch (error) {
    console.error('Driver login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { password } = req.body;

    // Validate input
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Check admin password (from environment variable)
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin password' });
    }

    // Generate token for admin
    const token = generateToken('admin', 'admin');

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// Driver Logout
router.post('/driver/logout', async (req, res) => {
  try {
    const { driverId, location } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: 'Driver ID is required' });
    }

    // Find and update driver status
    const driver = await Driver.findOne({ driverId: driverId.toUpperCase() });
    if (driver) {
      driver.isOnline = false;
      await driver.save();
    }

    // Update the latest active session
    const DriverSession = require('../models/DriverSession');
    const session = await DriverSession.findOne({
      driverId: driver._id,
      logoutTime: null
    }).sort({ loginTime: -1 });

    if (session) {
      session.logoutTime = new Date();
      session.logoutLocation = location || null;
      session.sessionDuration = Math.round((session.logoutTime - session.loginTime) / (1000 * 60)); // in minutes
      session.isActive = false;
      await session.save();
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Driver logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Forgot Password (placeholder for future implementation)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Send email with reset link
    // 3. Store token in database with expiration
    
    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;