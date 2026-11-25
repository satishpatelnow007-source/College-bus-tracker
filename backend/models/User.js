// User model for students and faculty
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'faculty'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
  // Only hash password if it's new or modified
  if (!this.isModified('password')) return next();
  
  // Hash password with salt rounds of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);