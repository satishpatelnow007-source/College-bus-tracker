// Main server file - Entry point for the backend application
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/driver');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');

// Create Express app
const app = express();
const server = http.createServer(app);

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174"
];

// Setup Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
})); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  family: 4
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes - API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO connection handling for real-time features
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Handle driver location updates
  socket.on('driver-location-update', (data) => {
    console.log('📍 Driver location update:', data.busNumber, data.location);
    // Broadcast location to all connected students/admins
    io.emit('bus-location-update', {
      busNumber: data.busNumber,
      location: data.location,
      timestamp: new Date()
    });
  });

  // Handle driver going online
  socket.on('driver-online', (data) => {
    console.log('🟢 Driver online:', data.busNumber);
    io.emit('driver-status-change', {
      busNumber: data.busNumber,
      status: 'online',
      timestamp: new Date()
    });
  });

  // Handle driver going offline
  socket.on('driver-offline', (data) => {
    console.log('🔴 Driver offline:', data.busNumber);
    io.emit('driver-status-change', {
      busNumber: data.busNumber,
      status: 'offline',
      timestamp: new Date()
    });
  });

  // Handle admin notifications
  socket.on('admin-notification', (data) => {
    console.log('📢 Admin notification:', data.title);
    // Broadcast notification to all students
    socket.broadcast.emit('new-notification', {
      title: data.title,
      message: data.message,
      type: data.type,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Frontend should connect to: http://localhost:${PORT}`);
});