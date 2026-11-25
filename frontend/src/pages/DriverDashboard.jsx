import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { socketEvents } from '../utils/socket';
import DriverMap from '../components/DriverMap';

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    socketEvents.connect();
    getCurrentLocation();
    
    return () => {
      socketEvents.disconnect();
    };
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const toggleOnlineStatus = async () => {
    setLoading(true);
    
    try {
      if (!isOnline) {
        await api.post('/driver/location', location);
        socketEvents.emitDriverOnline({ busNumber: user.busNumber });
        setIsOnline(true);
        
        const locationInterval = setInterval(() => {
          getCurrentLocation();
          if (location) {
            api.post('/driver/location', location);
            socketEvents.emitDriverLocationUpdate({
              busNumber: user.busNumber,
              location
            });
          }
        }, 10000);
        
        localStorage.setItem('locationInterval', locationInterval);
      } else {
        await api.post('/driver/logout', { location });
        socketEvents.emitDriverOffline({ busNumber: user.busNumber });
        setIsOnline(false);
        
        const intervalId = localStorage.getItem('locationInterval');
        if (intervalId) {
          clearInterval(intervalId);
          localStorage.removeItem('locationInterval');
        }
      }
    } catch (error) {
      alert('Error updating status: ' + (error.response?.data?.message || error.message));
    }
    
    setLoading(false);
  };

  const logout = async () => {
    try {
      await api.post('/driver/logout', { location });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '2rem', 
          borderRadius: '15px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#333' }}>Driver Dashboard</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              Welcome, {user.name} | Bus: {user.busNumber}
            </p>
          </div>
          <button onClick={logout} style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '2rem', 
          borderRadius: '15px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>
            {isOnline ? '🟢' : '🔴'}
          </div>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>
            Status: {isOnline ? 'Online' : 'Offline'}
          </h2>
          
          <button
            onClick={toggleOnlineStatus}
            disabled={loading || !location}
            style={{
              background: isOnline ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '500',
              cursor: loading || !location ? 'not-allowed' : 'pointer',
              opacity: loading || !location ? 0.7 : 1
            }}
          >
            {loading ? 'Updating...' : (isOnline ? 'Go Offline' : 'Go Online')}
          </button>
          
          {!location && (
            <p style={{ color: '#ef4444', marginTop: '10px' }}>
              Please enable location access to continue
            </p>
          )}
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '2rem', 
          borderRadius: '15px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>Current Location</h3>
          {location ? (
            <div style={{ color: '#666' }}>
              <p>Latitude: {location.latitude.toFixed(6)}</p>
              <p>Longitude: {location.longitude.toFixed(6)}</p>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                Location updates every 10 seconds when online
              </p>
            </div>
          ) : (
            <p style={{ color: '#ef4444' }}>Location not available</p>
          )}
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '2rem', 
          borderRadius: '15px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>Live Map</h3>
          {location ? (
            <DriverMap location={location} height="400px" />
          ) : (
            <div style={{
              height: '400px',
              background: '#f3f4f6',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280'
            }}>
              Enable location to view map
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;