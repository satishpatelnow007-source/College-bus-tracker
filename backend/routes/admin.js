// Admin routes for CRUD operations on buses, drivers, routes, and users
const express = require('express');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const User = require('../models/User');
const Notification = require('../models/Notification');
const DriverSession = require('../models/DriverSession');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Apply admin authentication to all routes except driver creation for testing
// router.use(authenticateToken, requireAdmin);

// ===== BUS MANAGEMENT =====

// Get all buses
router.get('/buses', async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate('driver', 'name phone ')
      .populate('route', 'routeName startPoint endPoint');
    res.json({ buses });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({ message: 'Server error getting buses' });
  }
});

// Create new bus
router.post('/buses', async (req, res) => {
  try {
    const { busNumber, capacity, routeId, driverId } = req.body;

    if (!busNumber || !capacity || !routeId) {
      return res.status(400).json({ message: 'Bus number, capacity, and route are required' });
    }

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ busNumber: busNumber.toUpperCase() });
    if (existingBus) {
      return res.status(400).json({ message: 'Bus number already exists' });
    }

    const bus = new Bus({
      busNumber: busNumber.toUpperCase(),
      capacity,
      route: routeId,
      driver: driverId || null
    });

    await bus.save();
    await bus.populate('driver', 'name phone');
    await bus.populate('route', 'routeName');

    res.status(201).json({ message: 'Bus created successfully', bus });
  } catch (error) {
    console.error('Create bus error:', error);
    res.status(500).json({ message: 'Server error creating bus' });
  }
});

// Update bus
router.put('/buses/:id', async (req, res) => {
  try {
    const { capacity, routeId, driverId, status } = req.body;

    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Update fields
    if (capacity) bus.capacity = capacity;
    if (routeId) bus.route = routeId;
    if (driverId !== undefined) bus.driver = driverId || null;
    if (status) bus.status = status;

    await bus.save();
    await bus.populate('driver', 'name phone');
    await bus.populate('route', 'routeName');

    res.json({ message: 'Bus updated successfully', bus });
  } catch (error) {
    console.error('Update bus error:', error);
    res.status(500).json({ message: 'Server error updating bus' });
  }
});

// Delete bus
router.delete('/buses/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    bus.isActive = false;
    await bus.save();

    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({ message: 'Server error deleting bus' });
  }
});

// ===== DRIVER MANAGEMENT =====

// Get all drivers
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password');
    res.json({ drivers });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error getting drivers' });
  }
});

// Create new driver
router.post('/drivers', async (req, res) => {
  try {
    const { name, driverId, busNumber, password, phone,} = req.body;

    if (!name || !driverId || !busNumber || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const driver = new Driver({
      name,
      driverId: driverId.toUpperCase(),
      busNumber: busNumber.toUpperCase(),
      password,
      phone
    });

    await driver.save();

    const driverResponse = driver.toObject();
    delete driverResponse.password;

    res.status(201).json({ message: 'Driver created successfully', driver: driverResponse });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Driver ID, bus number already exists' });
    }
    console.error('Create driver error:', error);
    res.status(500).json({ message: 'Server error creating driver' });
  }
});

// Update driver
router.put('/drivers/:id', async (req, res) => {
  try {
    const { name, phone, isActive, busNumber } = req.body;

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Update fields
    if (name) driver.name = name;
    if (phone) driver.phone = phone;
    if (busNumber) driver.busNumber = busNumber.toUpperCase();
    if (isActive !== undefined) driver.isActive = isActive;

    await driver.save();

    const driverResponse = driver.toObject();
    delete driverResponse.password;

    res.json({ message: 'Driver updated successfully', driver: driverResponse });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ message: 'Server error updating driver' });
  }
});

// Delete driver
router.delete('/drivers/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.isActive = false;
    await driver.save();

    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ message: 'Server error deleting driver' });
  }
});

// ===== ROUTE MANAGEMENT =====

// Get all routes
router.get('/routes', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json({ routes });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ message: 'Server error getting routes' });
  }
});

// Create new route
router.post('/routes', async (req, res) => {
  try {
    const { routeName, startPoint, endPoint, stops, totalDistance, estimatedDuration } = req.body;

    if (!routeName || !startPoint || !endPoint) {
      return res.status(400).json({ message: 'Route name, start point, and end point are required' });
    }

    const route = new Route({
      routeName,
      startPoint,
      endPoint,
      stops: stops || [],
      totalDistance: totalDistance || 0,
      estimatedDuration: estimatedDuration || 0
    });

    await route.save();

    res.status(201).json({ message: 'Route created successfully', route });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({ message: 'Server error creating route' });
  }
});

// Update route
router.put('/routes/:id', async (req, res) => {
  try {
    const { routeName, startPoint, endPoint, stops, totalDistance, estimatedDuration } = req.body;

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Update fields
    if (routeName) route.routeName = routeName;
    if (startPoint) route.startPoint = startPoint;
    if (endPoint) route.endPoint = endPoint;
    if (stops) route.stops = stops;
    if (totalDistance !== undefined) route.totalDistance = totalDistance;
    if (estimatedDuration !== undefined) route.estimatedDuration = estimatedDuration;

    await route.save();

    res.json({ message: 'Route updated successfully', route });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ message: 'Server error updating route' });
  }
});

// Delete route
router.delete('/routes/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    route.isActive = false;
    await route.save();

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ message: 'Server error deleting route' });
  }
});

// ===== USER MANAGEMENT =====

// Get all users (students/faculty)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error getting users' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: 'User updated successfully', user: userResponse });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// ===== NOTIFICATION MANAGEMENT =====

// Get all notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error getting notifications' });
  }
});

// Create new notification
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notification = new Notification({
      title,
      message,
      type: type || 'info'
    });

    await notification.save();
    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error creating notification' });
  }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error deleting notification' });
  }
});

// ===== ANALYTICS & REPORTS =====

// Get driver session analytics
router.get('/analytics/driver-sessions', async (req, res) => {
  try {
    const { startDate, endDate, driverId } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.loginTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (driverId) {
      query.driverId = driverId;
    }

    const sessions = await DriverSession.find(query)
      .populate('driverId', 'name driverId busNumber')
      .sort({ loginTime: -1 });

    res.json({ sessions });
  } catch (error) {
    console.error('Get driver sessions error:', error);
    res.status(500).json({ message: 'Server error getting driver sessions' });
  }
});

// Reset driver session analytics (delete all sessions)
router.post('/analytics/reset', async (req, res) => {
  try {
    const result = await DriverSession.deleteMany({});
    res.json({ message: 'Driver session analytics reset', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Reset analytics error:', error);
    res.status(500).json({ message: 'Server error resetting analytics' });
  }
});

// ===== DASHBOARD DATA =====

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [totalBuses, activeBuses, totalDrivers, onlineDrivers, totalUsers, totalRoutes, totalNotifications] = await Promise.all([
      Bus.countDocuments(),
      Bus.countDocuments({ isActive: true, status: 'active' }),
      Driver.countDocuments(),
      Driver.countDocuments({ isOnline: true }),
      User.countDocuments(),
      Route.countDocuments({ isActive: true }),
      Notification.countDocuments({ isActive: true })
    ]);

    res.json({
      stats: {
        totalBuses,
        activeBuses,
        totalDrivers,
        onlineDrivers,
        totalUsers,
        totalRoutes,
        totalNotifications
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error getting dashboard data' });
  }
});

module.exports = router;