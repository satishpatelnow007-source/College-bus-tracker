# College Bus Tracking System

A comprehensive bus tracking system built with MERN stack featuring real-time location tracking, role-based authentication, and responsive design.

## Technologies Used

- **Frontend**: React + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Maps**: Leaflet API
- **Authentication**: JWT

## Features

### Driver Portal
- Live location sharing with GPS
- Real-time location updates via Socket.IO
- Login/logout tracking

### Student/Faculty Portal
- Real-time bus tracking
- Bus route information

### Admin Portal
- CRUD operations for buses, drivers, routes
- Dashboard for bus scheduling
- Driver registration management

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- MongoDB Compass (for GUI)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bus_tracking
JWT_SECRET=your_jwt_secret_key_here
ADMIN_PASSWORD=admin123
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

### MongoDB Setup

#### Using MongoDB Compass:
1. Download and install MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Create database: `bus_tracking`
4. The application will automatically create required collections


## API Endpoints

### Authentication
- `POST /api/auth/driver/login` - Driver login
- `POST /api/auth/student/register` - Student registration
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/admin/login` - Admin login

### Driver
- `POST /api/driver/location` - Update location
- `GET /api/driver/status` - Get driver status

### Admin
- `GET /api/admin/buses` - Get all buses
- `POST /api/admin/buses` - Create bus
- `PUT /api/admin/buses/:id` - Update bus
- `DELETE /api/admin/buses/:id` - Delete bus

## Socket Events

- `location-update` - Real-time location updates
- `driver-online` - Driver comes online
- `driver-offline` - Driver goes offline

## Project Structure

```
Bus_Tracking/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   └── package.json
└── README.md
```

## Running the Application

1. **Start MongoDB service**
   - If using local MongoDB: Start MongoDB service
   - If using MongoDB Atlas: Ensure connection string is correct in `.env`

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run seed    # Optional: Add sample data
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`


## License

This project is licensed under the MIT License.
