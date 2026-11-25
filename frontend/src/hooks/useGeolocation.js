// Custom hook for geolocation functionality
import { useState, useEffect } from 'react';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Default options for geolocation
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // 1 minute
    ...options,
  };

  // Get current position
  const getCurrentPosition = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = 'Failed to get location';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      defaultOptions
    );
  };

  // Watch position for continuous updates
  const watchPosition = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = 'Failed to watch location';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      defaultOptions
    );

    return watchId;
  };

  // Clear watch
  const clearWatch = (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  };

  // Request permission
  const requestPermission = async () => {
    if (!navigator.permissions) {
      return 'unsupported';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Error checking geolocation permission:', error);
      return 'error';
    }
  };

  return {
    location,
    error,
    loading,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    requestPermission,
  };
};

export default useGeolocation;