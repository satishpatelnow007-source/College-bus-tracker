// Driver routes for location updates and status management
const express = require('express');
const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const { authenticateToken, requireDriver } = require('../middleware/auth');
const router = express.Router();

// Update driver location
router.post('/location', authenticateToken, requireDriver, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    // Update driver location
    const driver = await Driver.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.currentLocation = {
      latitude,
      longitude,
      timestamp: new Date()
    };
    driver.isOnline = true;

    await driver.save();

    // Also update bus location if assigned
    await Bus.findOneAndUpdate(
      { driver: driver._id },
      {
        currentLocation: {
          latitude,
          longitude,
          timestamp: new Date()
        }
      }
    );

    res.json({
      message: 'Location updated successfully',
      location: driver.currentLocation
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Server error updating location' });
  }
});

// Get driver status
router.get('/status', authenticateToken, requireDriver, async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id).select('-password');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({
      driver: {
        id: driver._id,
        name: driver.name,
        busNumber: driver.busNumber,
        isOnline: driver.isOnline,
        currentLocation: driver.currentLocation
      }
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ message: 'Server error getting status' });
  }
});

// Driver logout (set offline)
router.post('/logout', authenticateToken, requireDriver, async (req, res) => {
  try {
    const { location } = req.body;
    const driver = await Driver.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Set driver offline
    driver.isOnline = false;
    await driver.save();

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

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Get assigned bus information
router.get('/bus', authenticateToken, requireDriver, async (req, res) => {
  try {
    const bus = await Bus.findOne({ driver: req.user.id })
      .populate('route', 'routeName stops startPoint endPoint');

    if (!bus) {
      return res.status(404).json({ message: 'No bus assigned to this driver' });
    }

    res.json({ bus });
  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({ message: 'Server error getting bus information' });
  }
});

module.exports = router;