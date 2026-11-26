
const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Driver = require('../models/Driver');

const {
  authenticateToken,
  requireDriver
} = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ==========================================
// STUDENT / FACULTY REGISTRATION
// ==========================================

router.post('/student/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof confirmPassword !== 'string'
    ) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    // Only student and faculty registration allowed
    const selectedRole = role || 'student';

    if (!['student', 'faculty'].includes(selectedRole)) {
      return res.status(400).json({
        message: 'Invalid user role'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists with this email'
      });
    }

    const user = new User({
      name: cleanName,
      email: cleanEmail,
      password,
      role: selectedRole
    });

    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    return res.status(201).json({
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

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'User already exists with this email'
      });
    }

    return res.status(500).json({
      message: 'Server error during registration'
    });
  }
});

// ==========================================
// STUDENT / FACULTY LOGIN
// ==========================================

router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Your account is deactivated'
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id.toString(), user.role);

    return res.status(200).json({
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

    return res.status(500).json({
      message: 'Server error during login'
    });
  }
});

// ==========================================
// DRIVER LOGIN
// ==========================================

router.post('/driver/login', async (req, res) => {
  try {
    const { driverId, password, location } = req.body;

    if (
      typeof driverId !== 'string' ||
      typeof password !== 'string' ||
      !driverId.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Driver ID and password are required'
      });
    }

    const driver = await Driver.findOne({
      driverId: driverId.trim().toUpperCase()
    });

    if (!driver) {
      return res.status(401).json({
        message: 'Invalid driver ID or password'
      });
    }

    if (!driver.isActive) {
      return res.status(403).json({
        message: 'Driver account is deactivated'
      });
    }

    const isPasswordValid = await driver.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid driver ID or password'
      });
    }

    // Validate optional location
    if (location !== undefined && location !== null) {
      const latitude = Number(location.latitude);
      const longitude = Number(location.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          message: 'Invalid location coordinates'
        });
      }

      driver.currentLocation = {
        latitude,
        longitude,
        timestamp: new Date()
      };
    }

    driver.isOnline = true;
    await driver.save();

    // Create driver session
    const DriverSession = require('../models/DriverSession');

    const session = new DriverSession({
      driverId: driver._id,
      busNumber: driver.busNumber,
      driverName: driver.name,
      loginTime: new Date(),
      loginLocation: location || null
    });

    await session.save();

    const token = generateToken(driver._id.toString(), 'driver');

    return res.status(200).json({
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

    return res.status(500).json({
      message: 'Server error during login'
    });
  }
});

// ==========================================
// ADMIN LOGIN
// ==========================================

router.post('/admin/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (typeof password !== 'string' || !password) {
      return res.status(400).json({
        message: 'Password is required'
      });
    }

    if (!process.env.ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD is not configured');

      return res.status(500).json({
        message: 'Admin authentication is not configured'
      });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        message: 'Invalid admin password'
      });
    }

    const token = generateToken('admin', 'admin');

    return res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);

    return res.status(500).json({
      message: 'Server error during login'
    });
  }
});

// ==========================================
// SECURE DRIVER LOGOUT
// ==========================================

router.post(
  '/driver/logout',
  authenticateToken,
  requireDriver,
  async (req, res) => {
    try {
      // Driver identity comes from verified JWT
      const driver = await Driver.findById(req.user.id);

      if (!driver) {
        return res.status(404).json({
          message: 'Driver not found'
        });
      }

      driver.isOnline = false;
      await driver.save();

      // Update latest active session
      const DriverSession = require('../models/DriverSession');

      const session = await DriverSession.findOne({
        driverId: driver._id,
        logoutTime: null
      }).sort({ loginTime: -1 });

      if (session) {
        session.logoutTime = new Date();

        session.sessionDuration = Math.max(
          0,
          Math.round(
            (session.logoutTime - session.loginTime) / (1000 * 60)
          )
        );

        session.isActive = false;
        await session.save();
      }

      return res.status(200).json({
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('Driver logout error:', error);

      return res.status(500).json({
        message: 'Server error during logout'
      });
    }
  }
);

// ==========================================
// FORGOT PASSWORD
// ==========================================

router.post('/forgot-password', async (req, res) => {
  return res.status(501).json({
    message: 'Password reset functionality is not implemented yet'
  });
});

module.exports = router;
