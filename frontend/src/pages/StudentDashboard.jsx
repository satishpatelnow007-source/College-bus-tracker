import React, { useState, useEffect } from 'react';
import BusMap from '../components/BusMap';
import { socketEvents } from '../utils/socket';
import { api } from '../utils/api';

const StudentDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [activeTab, setActiveTab] = useState('tracking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/student/login';
      return;
    }

    // Connect to socket
    socketEvents.connect();
    
    // Fetch initial data with delay to prevent rapid calls
    setTimeout(async () => {
      await Promise.all([
        fetchNotifications(),
        fetchRoutes(),
        fetchBuses()
      ]);
      setLoading(false);
    }, 100);

    // Listen for live location updates
    socketEvents.onBusLocationUpdate((data) => {
      setBuses(prevBuses => {
        const updatedBuses = [...prevBuses];
        const busIndex = updatedBuses.findIndex(bus => bus.number === data.busNumber);
        
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
            route: data.route || 'Unknown',
          });
        }
        return updatedBuses;
      });
    });

    // Listen for driver status changes
    socketEvents.onDriverStatusChange((data) => {
      setBuses(prevBuses => 
        prevBuses.map(bus => 
          bus.number === data.busNumber 
            ? { ...bus, status: data.status }
            : bus
        )
      );
    });

    return () => {
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
      setBuses((response.data.buses || []).map(bus => ({
        number: bus.busNumber,
        location: bus.currentLocation,
        status: bus.driver?.isOnline ? 'Online' : 'Offline',
        route: bus.route?.routeName || 'Unknown',
      })));
    } catch (error) {
      console.error('Error fetching buses:', error);
      setBuses([]);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚌</div>
          <h2>Loading Student Portal...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333', margin: 0 }}>🚌 Student Portal</h1>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
          style={{
            background: '#ff4757',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #e1e8ed'
      }}>
        <button 
          onClick={() => setActiveTab('tracking')}
          style={{
            background: activeTab === 'tracking' ? '#667eea' : 'transparent',
            color: activeTab === 'tracking' ? 'white' : '#333',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          🚌 Live Tracking
        </button>
        <button 
          onClick={() => setActiveTab('routes')}
          style={{
            background: activeTab === 'routes' ? '#667eea' : 'transparent',
            color: activeTab === 'routes' ? 'white' : '#333',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          🗺️ Routes
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          style={{
            background: activeTab === 'notifications' ? '#667eea' : 'transparent',
            color: activeTab === 'notifications' ? 'white' : '#333',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: '500',
            position: 'relative'
          }}
        >
          📢 Notifications
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: '#ff4757',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {notifications.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('gallery')}
          style={{
            background: activeTab === 'gallery' ? '#667eea' : 'transparent',
            color: activeTab === 'gallery' ? 'white' : '#333',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: '500',
            position: 'relative'
          }}
          >Gallery</button>
      </div>
      {/* Tab Content */}
      {activeTab === 'tracking' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
            <h3>Available Buses</h3>
            {buses.length === 0 ? (
              <p style={{ color: '#666' }}>No buses online</p>
            ) : (
              buses.map(bus => (
                <div 
                  key={bus.number}
                  onClick={() => setSelectedBus(bus)}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: selectedBus?.number === bus.number ? '#e3f2fd' : 'white',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>Bus {bus.number}</div>
                  <div style={{ fontSize: '12px', color: bus.status === 'Online' ? 'green' : 'red' }}>
                    {bus.status}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Route: {bus.route}
                  </div>
                </div>
              ))
            )}
          </div>
          <div>
            <BusMap 
              buses={buses} 
              selectedBus={selectedBus}
              height="500px"
            />
          </div>
        </div>
      )}

      {activeTab === 'routes' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>🗺️ Bus Routes</h2>
          {routes.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>No routes available</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {routes.map(route => (
                <div key={route._id} style={{
                  border: '1px solid #e1e8ed',
                  borderRadius: '8px',
                  padding: '15px',
                  background: '#f8f9fa'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{route.routeName}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <strong>📍 Start Point:</strong>
                      <p style={{ margin: '5px 0', color: '#666' }}>{route.startPoint?.name}</p>
                    </div>
                    <div>
                      <strong>🏁 End Point:</strong>
                      <p style={{ margin: '5px 0', color: '#666' }}>{route.endPoint?.name}</p>
                    </div>
                  </div>
                  {route.stops && route.stops.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>🚏 Stops:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                        {route.stops.map((stop, index) => (
                          <span key={index} style={{
                            background: '#667eea',
                            color: 'white',
                            padding: '3px 8px',
                            borderRadius: '15px',
                            fontSize: '12px'
                          }}>
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
        </div>
      )}

      {activeTab === 'notifications' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>📢 Notifications & Alerts</h2>
          {notifications.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>No notifications available</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px', maxHeight: '500px', overflowY: 'auto' }}>
              {notifications.map(notification => (
                <div key={notification._id} style={{
                  border: `2px solid ${
                    notification.type === 'alert' ? '#dc3545' :
                    notification.type === 'warning' ? '#ffc107' :
                    notification.type === 'announcement' ? '#28a745' : '#17a2b8'
                  }`,
                  borderRadius: '8px',
                  padding: '15px',
                  background: `${
                    notification.type === 'alert' ? '#f8d7da' :
                    notification.type === 'warning' ? '#fff3cd' :
                    notification.type === 'announcement' ? '#d4edda' : '#d1ecf1'
                  }`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>
                      {notification.type === 'alert' ? '🚨' :
                       notification.type === 'warning' ? '⚠️' :
                       notification.type === 'announcement' ? '📢' : 'ℹ️'} {notification.title}
                    </h3>
                    <span style={{
                      background: `${
                        notification.type === 'alert' ? '#dc3545' :
                        notification.type === 'warning' ? '#ffc107' :
                        notification.type === 'announcement' ? '#28a745' : '#17a2b8'
                      }`,
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}>
                      {notification.type}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', color: '#333', lineHeight: '1.5' }}>
                    {notification.message}
                  </p>
                  <small style={{ color: '#666' }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'gallery' && (
        <div>
          <img style={{width: '500px', height: '500px', borderRadius: '20px', margin: '15px' }} src="../bus_img1.jpg" alt="Bus mage"/>
          <img style={{width: '500px', height: '500px', borderRadius: '20px', margin: '15px' }} src="../bus_img2.jpg" alt="Bus mage"/>
          <img style={{width: '500px', height: '500px', borderRadius: '20px', margin: '15px' }} src="../bus_img3.jpg" alt="Bus mage"/>
          <img style={{width: '500px', height: '500px', borderRadius: '20px', margin: '15px' }} src="../bus_img4.jpg" alt="Bus mage"/>
        </div>
      )}
      {/* {activeTab === 'about_developers' && (
        <>
          <div style={{display: 'flex', justifyContent: 'space-around', marginBottom: '20px'}}>
            <div style={{border: '1px solid', borderRadius: '20px', padding: '20px'}}>
              <img style={{width: '300px', height: '300px', margin: '15px', filter: 'drop-shadow(5px 10px 22px #519ad9ff)' }} src="../Kuber.png" alt="Kuberachar A M"/>
              <p style={{fontWeight: 'bold'}}>KUBERACHAR A M</p>
              <p style={{fontWeight: 'bold'}}>COMPUTER SCIENCE AND ENGINEERING STUDENT</p>
              <p style={{fontWeight: 'bold'}}>Contribution: Backend Development</p>
            </div>
            <div style={{border: '1px solid', borderRadius: '20px', padding: '20px'}}>
              <img style={{width: '300px', height: '300px', margin: '15px', filter: 'drop-shadow(5px 10px 22px #519ad9ff)' }} src="../Nishchay.png" alt="Nishchay"/>
              <p style={{fontWeight: 'bold'}}>NISHCHAY K C</p>
              <p style={{fontWeight: 'bold'}}>COMPUTER SCIENCE AND ENGINEERING STUDENT</p>
              <p style={{fontWeight: 'bold'}}>Contribution: Frontend Development</p>
            </div>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '20px'}}>
            <div style={{border: '1px solid', borderRadius: '20px', padding: '20px'}}>
              <img style={{width: '300px', height: '300px', margin: '15px', filter: 'drop-shadow(5px 10px 22px #519ad9ff)' }} src="../Kiran.png" alt="Kiran Singh"/>
              <p style={{fontWeight: 'bold'}}>KIRAN SINGH J</p>
              <p style={{fontWeight: 'bold'}}>COMPUTER SCIENCE AND ENGINEERING STUDENT</p>
              <p style={{fontWeight: 'bold'}}>Contribution: Architecture Design</p>
            </div>
            <div style={{border: '1px solid', borderRadius: '20px', padding: '20px'}}>
              <img style={{width: '300px', height: '300px', margin: '15px', filter: 'drop-shadow(5px 10px 22px #519ad9ff)' }} src="../Nagesh.png" alt="Nagesh"/>
              <p style={{fontWeight: 'bold'}}>NAGESHA H</p>
              <p style={{fontWeight: 'bold'}}>COMPUTER SCIENCE AND ENGINEERING STUDENT</p>
              <p style={{fontWeight: 'bold'}}>Contribution: Research Analytics</p>
            </div>
          </div>
        </>
      )} */}
    </div>
  );
};

export default StudentDashboard;