// One-time migration script to remove latitude/longitude fields from existing Route documents
// Usage: from the `backend` folder run `node utils/cleanupRoutesLatLong.js` or `npm run cleanup-routes`
require('dotenv').config();
const mongoose = require('mongoose');
const Route = require('../models/Route');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment (check .env)');
    process.exit(1);
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ Connected to MongoDB');

  const routes = await Route.find();
  console.log(`Found ${routes.length} routes. Checking for lat/long fields...`);

  let updatedCount = 0;

  for (const route of routes) {
    let dirty = false;

    if (route.startPoint) {
      if (Object.prototype.hasOwnProperty.call(route.startPoint, 'latitude') || Object.prototype.hasOwnProperty.call(route.startPoint, 'longitude')) {
        if (route.startPoint.latitude !== undefined) delete route.startPoint.latitude;
        if (route.startPoint.longitude !== undefined) delete route.startPoint.longitude;
        dirty = true;
      }
    }

    if (route.endPoint) {
      if (Object.prototype.hasOwnProperty.call(route.endPoint, 'latitude') || Object.prototype.hasOwnProperty.call(route.endPoint, 'longitude')) {
        if (route.endPoint.latitude !== undefined) delete route.endPoint.latitude;
        if (route.endPoint.longitude !== undefined) delete route.endPoint.longitude;
        dirty = true;
      }
    }

    if (Array.isArray(route.stops) && route.stops.length > 0) {
      for (const stop of route.stops) {
        if (Object.prototype.hasOwnProperty.call(stop, 'latitude') || Object.prototype.hasOwnProperty.call(stop, 'longitude')) {
          if (stop.latitude !== undefined) delete stop.latitude;
          if (stop.longitude !== undefined) delete stop.longitude;
          dirty = true;
        }
      }
    }

    if (dirty) {
      await route.save();
      updatedCount++;
      console.log(`Updated route ${route._id}`);
    }
  }

  console.log(`✅ Cleanup complete. Updated ${updatedCount} route(s).`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error during cleanup:', err);
  process.exit(1);
});
