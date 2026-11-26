
import React, { useState, useEffect } from 'react';
import BusMap from '../components/BusMap';
import { socketEvents } from '../utils/socket';
import { api } from '../utils/api';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [activeTab, setActiveTab] = useState('tracking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/student/login';
      return;
    }

    socketEvents.connect();

    let isMounted = true;

    const loadDashboardData = async () => {
      await Promise.all([
        fetchNotifications(),
        fetchRoutes(),
        fetchBuses()
      ]);

      if (isMounted) {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadDashboardData, 100);

    socketEvents.onBusLocationUpdate((data) => {
      setBuses((prevBuses) => {
        const updatedBuses = [...prevBuses];

        const busIndex = updatedBuses.findIndex(
          (bus) => bus.number === data.busNumber
        );

        if (busIndex >= 0) {
          updatedBuses[busIndex] = {
            ...updatedBuses[busIndex],
            location: data.location,
            status: 'Online'
          };
        } else {
          updatedBuses.push({
            number: data.busNumber,
            location: data.location,
            status: 'Online',
            route: data.route || 'Unknown'
          });
        }

        return updatedBuses;
      });
    });

    socketEvents.onDriverStatusChange((data) => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) =>
          bus.number === data.busNumber
            ? { ...bus, status: data.status }
            : bus
        )
      );
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      socketEvents.removeAllListeners();
      socketEvents.disconnect();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/student/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/student/routes');
      setRoutes(response.data.routes || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await api.get('/student/buses');

      setBuses(
        (response.data.buses || []).map((bus) => ({
          number: bus.busNumber,
          location: bus.currentLocation,
          status: bus.driver?.isOnline ? 'Online' : 'Offline',
          route: bus.route?.routeName || 'Unknown'
        }))
      );
    } catch (error) {
      console.error('Error fetching buses:', error);
      setBuses([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="student-loading">
        <div>
          <h2>Loading Student Portal...</h2>
          <p>Please wait while we prepare your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">

      <header className="student-header">
        <div>
          <h1>Student Portal</h1>
          <p>College Campus Bus Tracking System</p>
        </div>

        <button
          className="student-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="student-container">

        <nav className="student-tabs">
          <button
            className={`student-tab ${
              activeTab === 'tracking' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('tracking')}
          >
            Live Tracking
          </button>

          <button
            className={`student-tab ${
              activeTab === 'routes' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('routes')}
          >
            Routes
          </button>

          <button
            className={`student-tab ${
              activeTab === 'notifications' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications

            {notifications.length > 0 && (
              <span className="student-tab-count">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            className={`student-tab ${
              activeTab === 'gallery' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('gallery')}
          >
            Gallery
          </button>
        </nav>

        {activeTab === 'tracking' && (
          <div className="tracking-layout">

            <section className="bus-list-panel">
              <h3>Available Buses</h3>

              {buses.length === 0 ? (
                <p className="student-empty">No buses available</p>
              ) : (
                <div className="bus-list">
                  {buses.map((bus) => (
                    <button
                      key={bus.number}
                      className={`bus-item ${
                        selectedBus?.number === bus.number
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => setSelectedBus(bus)}
                    >
                      <span className="bus-item-name">
                        Bus {bus.number}
                      </span>

                      <span
                        className={`bus-item-status ${
                          bus.status === 'Online'
                            ? 'status-online'
                            : 'status-offline'
                        }`}
                      >
                        {bus.status}
                      </span>

                      <span className="bus-item-route">
                        Route: {bus.route}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section>
              <BusMap
                buses={buses}
                selectedBus={selectedBus}
                height="500px"
              />
            </section>

          </div>
        )}

        {activeTab === 'routes' && (
          <section className="student-panel">
            <h2 className="student-panel-title">Bus Routes</h2>

            {routes.length === 0 ? (
              <p className="student-empty">
                No routes available
              </p>
            ) : (
              <div className="student-route-list">
                {routes.map((route) => (
                  <div
                    key={route._id}
                    className="student-route-card"
                  >
                    <h3>{route.routeName}</h3>

                    <div className="route-points">
                      <div className="route-point">
                        <strong>Start Point</strong>
                        <p>{route.startPoint?.name}</p>
                      </div>

                      <div className="route-point">
                        <strong>End Point</strong>
                        <p>{route.endPoint?.name}</p>
                      </div>
                    </div>

                    {route.stops && route.stops.length > 0 && (
                      <div className="route-stops">
                        <strong>Route Stops</strong>

                        <div className="route-stop-list">
                          {route.stops.map((stop, index) => (
                            <span
                              key={index}
                              className="route-stop"
                            >
                              {stop.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'notifications' && (
          <section className="student-panel">
            <h2 className="student-panel-title">
              Notifications & Alerts
            </h2>

            {notifications.length === 0 ? (
              <p className="student-empty">
                No notifications available
              </p>
            ) : (
              <div className="student-notification-list">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`student-notification ${
                      ['alert', 'warning', 'announcement'].includes(
                        notification.type
                      )
                        ? notification.type
                        : ''
                    }`}
                  >
                    <div className="notification-heading">
                      <h3>{notification.title}</h3>

                      <span className="notification-type">
                        {notification.type}
                      </span>
                    </div>

                    <p>{notification.message}</p>

                    <small>
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'gallery' && (
          <section className="student-panel">
            <h2 className="student-panel-title">
              Campus Bus Gallery
            </h2>

            <div className="student-gallery">
              <img src="/bus_img1.jpg" alt="Campus bus 1" />
              <img src="/bus_img2.jpg" alt="Campus bus 2" />
              <img src="/bus_img3.jpg" alt="Campus bus 3" />
              <img src="/bus_img4.jpg" alt="Campus bus 4" />
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;
