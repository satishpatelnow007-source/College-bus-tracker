// Student/Faculty routes for bus tracking and information
const express = require('express');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all active buses
router.get('/buses', authenticateToken, async (req, res) => {
  try {
    const buses = await Bus.find({ isActive: true })
      .populate('driver', 'name phone isOnline')
      .populate('route', 'routeName stops startPoint endPoint')
      .select('busNumber capacity currentLocation status');

    res.json({ buses });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({ message: 'Server error getting buses' });
  }
});

// Get specific bus location and details
router.get('/bus/:busNumber', authenticateToken, async (req, res) => {
  try {
    const { busNumber } = req.params;

    const bus = await Bus.findOne({ 
      busNumber: busNumber.toUpperCase(), 
      isActive: true 
    })
    .populate('driver', 'name phone isOnline currentLocation')
    .populate('route', 'routeName stops startPoint endPoint totalDistance estimatedDuration');

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Calculate ETA if bus has current location and route
    let eta = null;
    if (bus.currentLocation && bus.route) {
      // Simple ETA calculation (this can be enhanced with real routing APIs)
      const averageSpeed = 30; // km/h average speed in city
      const estimatedDistance = bus.route.totalDistance || 10; // fallback distance
      eta = Math.round((estimatedDistance / averageSpeed) * 60); // in minutes
    }

    res.json({
      bus: {
        busNumber: bus.busNumber,
        capacity: bus.capacity,
        status: bus.status,
        currentLocation: bus.currentLocation,
        driver: bus.driver,
        route: bus.route,
        eta: eta
      }
    });
  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({ message: 'Server error getting bus details' });
  }
});

// Get all routes
router.get('/routes', authenticateToken, async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true })
      .select('routeName startPoint endPoint stops totalDistance estimatedDuration');

    res.json({ routes });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ message: 'Server error getting routes' });
  }
});

// Get route details
router.get('/route/:id', authenticateToken, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Get buses on this route
    const buses = await Bus.find({ route: route._id, isActive: true })
      .populate('driver', 'name phone isOnline')
      .select('busNumber capacity currentLocation status');

    res.json({
      route,
      buses
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ message: 'Server error getting route details' });
  }
});

// Calculate ETA for a specific stop
router.post('/eta', authenticateToken, async (req, res) => {
  try {
    const { busNumber, stopLatitude, stopLongitude } = req.body;

    if (!busNumber || !stopLatitude || !stopLongitude) {
      return res.status(400).json({ message: 'Bus number and stop coordinates are required' });
    }

    const bus = await Bus.findOne({ 
      busNumber: busNumber.toUpperCase(), 
      isActive: true 
    }).populate('driver', 'currentLocation isOnline');

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (!bus.driver || !bus.driver.isOnline || !bus.currentLocation) {
      return res.json({ 
        eta: null, 
        message: 'Bus location not available' 
      });
    }

    // Simple distance calculation using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const distance = calculateDistance(
      bus.currentLocation.latitude,
      bus.currentLocation.longitude,
      stopLatitude,
      stopLongitude
    );

    // Calculate ETA (assuming average speed of 25 km/h in city traffic)
    const averageSpeed = 25;
    const etaMinutes = Math.round((distance / averageSpeed) * 60);

    res.json({
      eta: etaMinutes,
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      busLocation: bus.currentLocation
    });
  } catch (error) {
    console.error('ETA calculation error:', error);
    res.status(500).json({ message: 'Server error calculating ETA' });
  }
});

// Get notifications for students
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error getting notifications' });
  }
});

module.exports = router;