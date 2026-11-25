// Authentication middleware for JWT token verification
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user based on role
    let user;
    if (decoded.role === 'driver') {
      user = await Driver.findById(decoded.id);
    } else if (decoded.role === 'admin') {
      // Admin doesn't have a model, just verify the token
      req.user = decoded;
      return next();
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Add user info to request object
    req.user = {
      id: user._id,
      role: decoded.role,
      ...user.toObject()
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware to check if user is driver
const requireDriver = (req, res, next) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ message: 'Driver access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireDriver
};