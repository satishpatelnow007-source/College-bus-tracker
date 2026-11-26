
require('dotenv').config();

const mongoose = require('mongoose');
const Route = require('./models/Route');
const Driver = require('./models/Driver');
const Bus = require('./models/Bus');

async function createDemoDriver() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Create or reuse a demo route
    let route = await Route.findOne({
      routeName: 'Demo Campus Route'
    });

    if (!route) {
      route = await Route.create({
        routeName: 'Demo Campus Route',
        startPoint: { name: 'Main Gate' },
        endPoint: { name: 'Library' },
        stops: [
          { name: 'Student Center', estimatedTime: '5 min' },
          { name: 'Cafeteria', estimatedTime: '10 min' }
        ],
        totalDistance: 5,
        estimatedDuration: 15
      });
    }

    // 2. Create or reuse demo driver
    let driver = await Driver.findOne({ driverId: 'DRV001' });

    if (!driver) {
      driver = await Driver.create({
        name: 'Demo Driver',
        driverId: 'DRV001',
        busNumber: 'BUS001',
        password: process.env.DEMO_DRIVER_PASSWORD,
        phone: '9999999999'
      });
    }

    // 3. Create or reuse demo bus
    let bus = await Bus.findOne({ busNumber: 'BUS001' });

    if (!bus) {
      bus = await Bus.create({
        busNumber: 'BUS001',
        capacity: 45,
        route: route._id,
        driver: driver._id,
        status: 'active'
      });
    }

    console.log('Demo data ready!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createDemoDriver();
