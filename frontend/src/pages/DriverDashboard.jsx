
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { socketEvents } from "../utils/socket";
import DriverMap from "../components/DriverMap";
import "../styles/DriverDashboard.css";

const DriverDashboard = () => {
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const intervalRef = useRef(null);
  const locationRef = useRef(null);
  const isOnlineRef = useRef(false);
  const mountedRef = useRef(true);

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const clearLocationInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          locationRef.current = currentLocation;

          if (mountedRef.current) {
            setLocation(currentLocation);
            setLocationError("");
          }

          resolve(currentLocation);
        },
        (error) => {
          let message = "Unable to get your current location.";

          if (error.code === error.PERMISSION_DENIED) {
            message = "Location permission denied. Please allow location access.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = "Your current location is unavailable.";
          } else if (error.code === error.TIMEOUT) {
            message = "Location request timed out. Please try again.";
          }

          if (mountedRef.current) {
            setLocationError(message);
          }

          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/driver/login", { replace: true });
      return;
    }

    socketEvents.connect();

    getCurrentLocation().catch((error) => {
      console.error("Location error:", error.message);
    });

    return () => {
      mountedRef.current = false;
      isOnlineRef.current = false;
      clearLocationInterval();
      socketEvents.disconnect();
    };
  }, [navigate, getCurrentLocation]);

  const startLocationUpdates = () => {
    clearLocationInterval();

    intervalRef.current = setInterval(async () => {
      if (!isOnlineRef.current) return;

      try {
        const updatedLocation = await getCurrentLocation();

        if (!isOnlineRef.current) return;

        await api.post("/driver/location", updatedLocation);

        socketEvents.emitDriverLocationUpdate({
          busNumber: user.busNumber,
          location: updatedLocation,
        });
      } catch (error) {
        console.error("Location update failed:", error.message);
      }
    }, 10000);
  };

  const toggleOnlineStatus = async () => {
    setLoading(true);

    try {
      if (!isOnline) {
        const currentLocation = await getCurrentLocation();

        await api.post("/driver/location", currentLocation);

        socketEvents.emitDriverOnline({
          busNumber: user.busNumber,
        });

        isOnlineRef.current = true;
        setIsOnline(true);

        startLocationUpdates();
      } else {
        await api.post("/driver/logout", {
          location: locationRef.current,
        });

        socketEvents.emitDriverOffline({
          busNumber: user.busNumber,
        });

        isOnlineRef.current = false;
        setIsOnline(false);

        clearLocationInterval();
      }
    } catch (error) {
      console.error("Status update failed:", error);
      alert(
        error.message || "Unable to update driver status. Please try again."
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/driver/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (isOnlineRef.current) {
        socketEvents.emitDriverOffline({
          busNumber: user.busNumber,
        });
      }

      isOnlineRef.current = false;
      clearLocationInterval();

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to logout. Please try again.");
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleRetryLocation = () => {
    getCurrentLocation().catch((error) => {
      console.error("Location error:", error.message);
    });
  };

  return (
    <div className="driver-dashboard">
      <div className="driver-container">
        <header className="driver-header">
          <div>
            <h1>Driver Dashboard</h1>
            <p>Manage your availability and live bus location.</p>
          </div>

          <button
            className="driver-logout"
            onClick={handleLogout}
            disabled={loading}
          >
            Logout
          </button>
        </header>

        <section className="driver-status-card">
          <div className="driver-status-label">
            <span
              className={`driver-status-indicator ${
                isOnline ? "online" : "offline"
              }`}
            ></span>

            <span>{isOnline ? "You are Online" : "You are Offline"}</span>
          </div>

          <h2>
            {isOnline
              ? "Your bus is visible to students"
              : "You are currently unavailable"}
          </h2>

          <p>
            {isOnline
              ? "Your location is being updated automatically every 10 seconds."
              : "Go online when you are ready to start sharing your bus location."}
          </p>

          <button
            className={`driver-status-button ${
              isOnline ? "offline" : "online"
            }`}
            onClick={toggleOnlineStatus}
            disabled={loading || !location}
          >
            {loading
              ? "Please wait..."
              : isOnline
              ? "Go Offline"
              : "Go Online"}
          </button>
        </section>

        {locationError && (
          <div className="driver-location-warning">
            <p>{locationError}</p>
            <button onClick={handleRetryLocation}>
              Retry Location
            </button>
          </div>
        )}

        <section className="driver-info-grid">
          <div className="driver-info-card">
            <h3>Driver Name</h3>
            <p>{user.name || "Driver"}</p>
          </div>

          <div className="driver-info-card">
            <h3>Bus Number</h3>
            <p>{user.busNumber || "Not assigned"}</p>
          </div>

          <div className="driver-info-card">
            <h3>Current Status</h3>
            <p className={isOnline ? "online-text" : "offline-text"}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </section>

        <section className="driver-map-card">
          <div className="driver-map-header">
            <h2>Live Location</h2>
            <p>Your current bus location on the map.</p>
          </div>

          {location ? (
            <>
              <div className="driver-coordinate">
                <p>
                  Latitude: {location.latitude.toFixed(6)}
                </p>
                <p>
                  Longitude: {location.longitude.toFixed(6)}
                </p>
              </div>

              <DriverMap
                location={location}
                height="400px"
              />
            </>
          ) : (
            <div className="driver-map-placeholder">
              <p>Waiting for your current location...</p>
              <button onClick={handleRetryLocation}>
                Get Current Location
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DriverDashboard;
