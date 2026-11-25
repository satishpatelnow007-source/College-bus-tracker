// Driver model for bus drivers
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  driverId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  busNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
driverSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
driverSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Driver', driverSchema);