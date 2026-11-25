// Sample data seeder for development and testing
const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const User = require('../models/User');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    console.log('🌱 Seeding sample data...');

    // Clear existing data
    await Promise.all([
      Driver.deleteMany({}),
      Bus.deleteMany({}),
      Route.deleteMany({}),
      User.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // Create sample routes
    const routes = await Route.insertMany([
      {
        routeName: 'Main Campus Route',
        startPoint: { name: 'Main Gate' },
        endPoint: { name: 'Library' },
        stops: [
          { name: 'Student Center', estimatedTime: '5 min' },
          { name: 'Engineering Building', estimatedTime: '10 min' },
          { name: 'Cafeteria', estimatedTime: '15 min' }
        ],
        totalDistance: 12.5,
        estimatedDuration: 25
      },
      {
        routeName: 'Hostel Route',
        startPoint: { name: 'Hostel Block A' },
        endPoint: { name: 'Academic Block' },
        stops: [
          { name: 'Hostel Block B', estimatedTime: '3 min' },
          { name: 'Sports Complex', estimatedTime: '8 min' }
        ],
        totalDistance: 8.2,
        estimatedDuration: 15
      }
    ]);

    // Create sample drivers
    const drivers = await Driver.insertMany([
      {
        name: 'John Smith',
        driverId: 'DRV001',
        busNumber: 'BUS001',
        password: 'driver123',
        phone: '+1-555-0101',
        licenseNumber: 'DL123456789'
      },
      {
        name: 'Mike Johnson',
        driverId: 'DRV002',
        busNumber: 'BUS002',
        password: 'driver123',
        phone: '+1-555-0102',
        licenseNumber: 'DL987654321'
      },
      {
        name: 'Sarah Wilson',
        driverId: 'DRV003',
        busNumber: 'BUS003',
        password: 'driver123',
        phone: '+1-555-0103',
        licenseNumber: 'DL456789123'
      }
    ]);

    // Create sample buses
    const buses = await Bus.insertMany([
      {
        busNumber: 'BUS001',
        capacity: 45,
        route: routes[0]._id,
        driver: drivers[0]._id,
        status: 'active'
      },
      {
        busNumber: 'BUS002',
        capacity: 40,
        route: routes[1]._id,
        driver: drivers[1]._id,
        status: 'active'
      },
      {
        busNumber: 'BUS003',
        capacity: 50,
        route: routes[0]._id,
        driver: drivers[2]._id,
        status: 'maintenance'
      }
    ]);

    // Create sample users
    const users = await User.insertMany([
      {
        name: 'Alice Cooper',
        email: 'student@college.edu',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Bob Teacher',
        email: 'faculty@college.edu',
        password: 'faculty123',
        role: 'faculty'
      },
      {
        name: 'Charlie Student',
        email: 'charlie@college.edu',
        password: 'student123',
        role: 'student'
      }
    ]);

    // Create sample notifications
    const notifications = await Notification.insertMany([
      {
        title: 'Service Update',
        message: 'Bus services will start 30 minutes early tomorrow due to special event.',
        type: 'announcement'
      },
      {
        title: 'Route Change',
        message: 'Main Campus Route will have a temporary detour near the construction site.',
        type: 'warning'
      },
      {
        title: 'Welcome Message',
        message: 'Welcome to the new bus tracking system! You can now track buses in real-time.',
        type: 'info'
      }
    ]);

    console.log('✅ Sample data seeded successfully!');
    console.log(`📊 Created: ${routes.length} routes, ${drivers.length} drivers, ${buses.length} buses, ${users.length} users, ${notifications.length} notifications`);
    
    console.log('\n🔑 Demo Credentials:');
    console.log('Student Login: student@college.edu / student123');
    console.log('Faculty Login: faculty@college.edu / faculty123');
    console.log('Driver Login: DRV001 / driver123 (or DRV002, DRV003)');
    console.log('Admin Login: admin123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

module.exports = seedData;