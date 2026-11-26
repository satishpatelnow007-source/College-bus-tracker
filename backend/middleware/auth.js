
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access token required'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Access token required'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');

      return res.status(500).json({
        message: 'Authentication is not configured'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate token payload
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }

    // Admin authentication
    if (decoded.role === 'admin') {
      if (decoded.id !== 'admin') {
        return res.status(401).json({
          message: 'Invalid admin token'
        });
      }

      req.user = {
        id: 'admin',
        role: 'admin'
      };

      return next();
    }

    let user;

    // Driver authentication
    if (decoded.role === 'driver') {
      user = await Driver.findById(decoded.id).select(
        'name driverId busNumber phone isActive isOnline'
      );
    }
    // Student/Faculty authentication
    else if (
      decoded.role === 'student' ||
      decoded.role === 'faculty'
    ) {
      user = await User.findById(decoded.id).select(
        'name email role isActive'
      );
    } else {
      return res.status(403).json({
        message: 'Invalid user role'
      });
    }

    // Check user exists
    if (!user) {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Your account is deactivated'
      });
    }

    // Ensure database role matches token role
    if (
      decoded.role !== 'driver' &&
      user.role !== decoded.role
    ) {
      return res.status(403).json({
        message: 'User role does not match token'
      });
    }

    // Attach safe user information
    req.user = {
      id: user._id.toString(),
      role: decoded.role,
      name: user.name,
      ...(decoded.role === 'driver'
        ? {
            driverId: user.driverId,
            busNumber: user.busNumber,
            phone: user.phone,
            isOnline: user.isOnline
          }
        : {
            email: user.email
          })
    };

    return next();

  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }

    console.error('Authentication error:', error);

    return res.status(500).json({
      message: 'Authentication server error'
    });
  }
};

// Middleware to check Admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required'
    });
  }

  return next();
};

// Middleware to check Driver role
const requireDriver = (req, res, next) => {
  if (!req.user || req.user.role !== 'driver') {
    return res.status(403).json({
      message: 'Driver access required'
    });
  }

  return next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireDriver
};
