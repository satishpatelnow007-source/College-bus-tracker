const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'alert', 'announcement'],
    default: 'info'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);