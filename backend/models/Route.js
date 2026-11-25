// Route model for bus routes
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true,
    trim: true
  },
  startPoint: {
    name: String
  },
  endPoint: {
    name: String
  },
  stops: [{
    name: {
      type: String,
      required: true
    },
    estimatedTime: String // Time from start point
  }],
  totalDistance: {
    type: Number, // in kilometers
    default: 0
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);