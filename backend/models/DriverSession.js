const mongoose = require('mongoose');

const driverSessionSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  busNumber: {
    type: String,
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  loginTime: {
    type: Date,
    required: true
  },
  logoutTime: {
    type: Date
  },
  loginLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  logoutLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  sessionDuration: {
    type: Number // in minutes
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DriverSession', driverSessionSchema);