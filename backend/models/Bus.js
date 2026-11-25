// Bus model for managing bus information
const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bus', busSchema);