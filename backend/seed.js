// Script to seed sample data
require('dotenv').config();
const mongoose = require('mongoose');
const seedData = require('./utils/seedData');

const runSeeder = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Run seeder
    await seedData();
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

runSeeder();