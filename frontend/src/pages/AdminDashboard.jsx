import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  
  // Driver Management State
  const [drivers, setDrivers] = useState([]);
  const [driverForm, setDriverForm] = useState({
    name: '', driverId: '', busNumber: '', password: '', phone: ''
  });
  const [editingDriver, setEditingDriver] = useState(null);
  
  // Route Management State
  const [routes, setRoutes] = useState([]);
  const [routeForm, setRouteForm] = useState({
    routeName: '', startPoint: { name: '' },
    endPoint: { name: '' }, 
    stops: []
  });
  const [editingRoute, setEditingRoute] = useState(null);

  // Small inline component to edit stops list
  const StopEditor = ({ stops = [], onChange }) => {
    const [name, setName] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');

    const addStop = () => {
      if (!name.trim()) return;
      const newStops = [...stops, { name: name.trim(), estimatedTime: estimatedTime.trim() }];
      onChange(newStops);
      setName('');
      setEstimatedTime('');
    };

    const removeStop = (idx) => {
      const newStops = stops.filter((_, i) => i !== idx);
      onChange(newStops);
    };

    return (
      <div className="stop-editor">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Stop Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Estimated Time (optional)"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
          />
          <button className="my-btn" type="button" onClick={addStop}>Add Stop</button>
        </div>

        <div className="stops-list">
          {stops && stops.length > 0 ? (
            stops.map((stop, idx) => (
              <div key={idx} className="stop-item" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                <div>
                  <strong>{stop.name}</strong>
                  {stop.estimatedTime ? <span> — {stop.estimatedTime}</span> : null}
                </div>
                <button type="button" onClick={() => removeStop(idx)}>Remove</button>
              </div>
            ))
          ) : (
            <small>No stops added</small>
          )}
        </div>
      </div>
    );
  };
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [notificationForm, setNotificationForm] = useState({
    title: '', message: '', type: 'info'
  });
  
  // Analytics State
  const [driverSessions, setDriverSessions] = useState([]);
  const [analyticsFilter, setAnalyticsFilter] = useState({
    startDate: '', endDate: '', driverId: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'drivers') fetchDrivers();
    else if (activeTab === 'routes') fetchRoutes();
    else if (activeTab === 'notifications') fetchNotifications();
    else if (activeTab === 'analytics') fetchDriverSessions();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/admin/drivers');
      // Only show active drivers in admin list so deleted drivers disappear
      const allDrivers = response.data.drivers || [];
      const activeDrivers = allDrivers.filter(d => d.isActive !== false);
      setDrivers(activeDrivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/admin/routes');
      // Filter to active routes so deleted routes (isActive: false) are hidden from admin list
      const allRoutes = response.data.routes || [];
      const activeRoutes = allRoutes.filter(r => r.isActive !== false);
      setRoutes(activeRoutes);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/admin/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchDriverSessions = async () => {
    try {
      const params = new URLSearchParams();
      if (analyticsFilter.startDate) params.append('startDate', analyticsFilter.startDate);
      if (analyticsFilter.endDate) params.append('endDate', analyticsFilter.endDate);
      if (analyticsFilter.driverId) params.append('driverId', analyticsFilter.driverId);
      
      const response = await api.get(`/admin/analytics/driver-sessions?${params}`);
      setDriverSessions(response.data.sessions);
    } catch (error) {
      console.error('Error fetching driver sessions:', error);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingDriver) {
        await api.put(`/admin/drivers/${editingDriver._id}`, driverForm);
        alert('Driver updated successfully!');
      } else {
        await api.post('/admin/drivers', driverForm);
        alert('Driver created successfully!');
      }
      setDriverForm({ name: '', driverId: '', busNumber: '', password: '', phone: '' });
      setEditingDriver(null);
      fetchDrivers();
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving driver');
    }
    setLoading(false);
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRoute) {
        await api.put(`/admin/routes/${editingRoute._id}`, routeForm);
        alert('Route updated successfully!');
      } else {
        await api.post('/admin/routes', routeForm);
        alert('Route created successfully!');
      }
      setRouteForm({
        routeName: '', startPoint: { name: '' },
        endPoint: { name: '' }, stops: []
      });
      setEditingRoute(null);
      fetchRoutes();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving route');
    }
    setLoading(false);
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/notifications', notificationForm);
      alert('Notification sent successfully!');
      setNotificationForm({ title: '', message: '', type: 'info' });
      fetchNotifications();
    } catch (error) {
      alert(error.response?.data?.message || 'Error sending notification');
    }
    setLoading(false);
  };

  const deleteDriver = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await api.delete(`/admin/drivers/${id}`);
        alert('Driver deleted successfully!');
        fetchDrivers();
        fetchDashboardData();
      } catch (error) {
        alert('Error deleting driver');
      }
    }
  };

  const deleteRoute = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await api.delete(`/admin/routes/${id}`);
        alert('Route deleted successfully!');
        fetchRoutes();
      } catch (error) {
        alert('Error deleting route');
      }
    }
  };

  const deleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await api.delete(`/admin/notifications/${id}`);
        alert('Notification deleted successfully!');
        fetchNotifications();
      } catch (error) {
        alert('Error deleting notification');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1 style={{ margin: 0, color: '#333' }}>Admin Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <nav className="admin-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'drivers' ? 'active' : ''} 
          onClick={() => setActiveTab('drivers')}
        >
          👨‍💼 Drivers
        </button>
        <button 
          className={activeTab === 'routes' ? 'active' : ''} 
          onClick={() => setActiveTab('routes')}
        >
          🗺️ Routes
        </button>
        <button 
          className={activeTab === 'notifications' ? 'active' : ''} 
          onClick={() => setActiveTab('notifications')}
        >
          📢 Notifications
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''} 
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>👨‍💼 Total Drivers</h3>
                <p>{stats.totalDrivers || 0}</p>
              </div>
              {/* <div className="stat-card">
                <h3>🟢 Online Drivers</h3>
                <p>{stats.onlineDrivers || 0}</p>
              </div> */}
              {/* <div className="stat-card">
                <h3>👥 Total Users</h3>
                <p>{stats.totalUsers || 0}</p>
              </div> */}
              <div className="stat-card">
                <h3>🗺️ Total Routes</h3>
                <p>{stats.totalRoutes || 0}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="drivers-section">
            <h2>Driver Management</h2>
            
            <form onSubmit={handleDriverSubmit} className="driver-form">
              <h3>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h3>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Driver Name"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({...driverForm, name: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Driver ID"
                  value={driverForm.driverId}
                  onChange={(e) => setDriverForm({...driverForm, driverId: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Bus Number"
                  value={driverForm.busNumber}
                  onChange={(e) => setDriverForm({...driverForm, busNumber: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={driverForm.password}
                  onChange={(e) => setDriverForm({...driverForm, password: e.target.value})}
                  required={!editingDriver}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({...driverForm, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingDriver ? 'Update Driver' : 'Add Driver')}
                </button>
                {editingDriver && (
                  <button type="button" onClick={() => {
                    setEditingDriver(null);
                    setDriverForm({ name: '', driverId: '', busNumber: '', password: '', phone: '' });
                  }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="drivers-list">
              <h3>Existing Drivers</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Driver ID</th>
                      <th>Bus Number</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(driver => (
                      <tr key={driver._id}>
                        <td>{driver.name}</td>
                        <td>{driver.driverId}</td>
                        <td>{driver.busNumber}</td>
                        <td>{driver.phone}</td>
                        <td>
                          <span className={`status ${driver.isOnline ? 'online' : 'offline'}`}>
                            {driver.isOnline ? '🟢 Online' : '🔴 Offline'}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => {
                              setEditingDriver(driver);
                              setDriverForm({
                                name: driver.name,
                                driverId: driver.driverId,
                                busNumber: driver.busNumber,
                                password: '',
                                phone: driver.phone
                              });
                            }}
                            className="edit-btn"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => deleteDriver(driver._id)}
                            className="delete-btn"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="routes-section">
            <h2>Route Management</h2>
            
            <form onSubmit={handleRouteSubmit} className="route-form">
              <h3>{editingRoute ? 'Edit Route' : 'Add New Route'}</h3>
              <input
                type="text"
                placeholder="Route Name"
                value={routeForm.routeName}
                onChange={(e) => setRouteForm({...routeForm, routeName: e.target.value})}
                required
              />
              
              <div className="location-inputs">
                <h4>Start Point</h4>
                <input
                  type="text"
                  placeholder="Start Point Name"
                  value={routeForm.startPoint.name}
                  onChange={(e) => setRouteForm({
                    ...routeForm, 
                    startPoint: {...routeForm.startPoint, name: e.target.value}
                  })}
                  required
                />
              </div>

              <div className="location-inputs">
                <h4>End Point</h4>
                <input
                  type="text"
                  placeholder="End Point Name"
                  value={routeForm.endPoint.name}
                  onChange={(e) => setRouteForm({
                    ...routeForm, 
                    endPoint: {...routeForm.endPoint, name: e.target.value}
                  })}
                  required
                />
              </div>

              <div className="stops-input">
                <h4>Stops (between start and end)</h4>
                <StopEditor
                  stops={routeForm.stops}
                  onChange={(stops) => setRouteForm({...routeForm, stops})}
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingRoute ? 'Update Route' : 'Add Route')}
                </button>
                {editingRoute && (
                  <button type="button" onClick={() => {
                    setEditingRoute(null);
                    setRouteForm({
                      routeName: '', startPoint: { name: '' },
                      endPoint: { name: '' }, stops: []
                    });
                  }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="routes-list">
              <h3>Existing Routes</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Route Name</th>
                      <th>Route Path</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map(route => (
                      <tr key={route._id}>
                        <td>{route.routeName}</td>
                        <td>
                          {route.startPoint?.name}
                          {route.stops && route.stops.length > 0 && (
                            <span> → {route.stops.map(s => s.name).join(' → ')} </span>
                          )}
                          <span> → {route.endPoint?.name}</span>
                        </td>
                        <td>
                          <button 
                            onClick={() => {
                              setEditingRoute(route);
                              setRouteForm({
                                routeName: route.routeName,
                                startPoint: route.startPoint || { name: '' },
                                endPoint: route.endPoint || { name: '' },
                                stops: route.stops || []
                              });
                            }}
                            className="edit-btn"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => deleteRoute(route._id)}
                            className="delete-btn"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-section">
            <h2>Notification Management</h2>
            
            <form onSubmit={handleNotificationSubmit} className="notification-form">
              <h3>Send New Notification</h3>
              <input
                type="text"
                placeholder="Notification Title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Notification Message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                rows="4"
                required
              />
              <select
                value={notificationForm.type}
                onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
              >
                <option value="info">ℹ️ Info</option>
                <option value="warning">⚠️ Warning</option>
                <option value="alert">🚨 Alert</option>
                <option value="announcement">📢 Announcement</option>
              </select>
              <button className="my-btn" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </form>

            <div className="notifications-list">
              <h3>Recent Notifications</h3>
              <div className="notifications-container">
                {notifications.map(notification => (
                  <div key={notification._id} className={`notification-card ${notification.type}`}>
                    <div className="notification-header">
                      <h4>{notification.title}</h4>
                      <span className="notification-type">{notification.type}</span>
                    </div>
                    <p>{notification.message}</p>
                    <div className="notification-footer">
                      <small>{new Date(notification.createdAt).toLocaleString()}</small>
                      <button 
                        onClick={() => deleteNotification(notification._id)}
                        className="delete-btn small"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            {/* <h2>Driver Analytics & Reports</h2>
            
            <div className="analytics-filters">
              <h3>Filter Sessions</h3>
              <div className="filter-grid">
                <input
                  type="date"
                  value={analyticsFilter.startDate}
                  onChange={(e) => setAnalyticsFilter({...analyticsFilter, startDate: e.target.value})}
                />
                <input
                  type="date"
                  value={analyticsFilter.endDate}
                  onChange={(e) => setAnalyticsFilter({...analyticsFilter, endDate: e.target.value})}
                />
                <select
                  value={analyticsFilter.driverId}
                  onChange={(e) => setAnalyticsFilter({...analyticsFilter, driverId: e.target.value})}
                >
                  <option value="">All Drivers</option>
                  {drivers.map(driver => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name} ({driver.driverId})
                    </option>
                  ))}
                </select>
                <button onClick={fetchDriverSessions}>Apply Filters</button>
              </div>
            </div> */}

            <div className="sessions-list">
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h3>Driver Sessions</h3>
              <div>
                <button
                  type="button"
                  className="danger-btn my-btn"
                  onClick={async () => {
                    if (!window.confirm('Reset analytics data? This will permanently delete all driver session records.')) return;
                    setLoading(true);
                    try {
                      await api.post('/admin/analytics/reset');
                      setDriverSessions([]);
                      fetchDashboardData();
                      alert('Analytics data reset successfully');
                    } catch (err) {
                      alert(err.response?.data?.message || 'Error resetting analytics');
                    }
                    setLoading(false);
                  }}
                >
                  Reset Analytics
                </button>
              </div>
            </div>

            <div className="table-container">
              <table>
                  <thead>
                    <tr>
                      <th>Driver</th>
                      <th>Bus Number</th>
                      <th>Login Time</th>
                      <th>Logout Time</th>
                      <th>Duration (min)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverSessions.map(session => (
                      <tr key={session._id}>
                        <td>{session.driverName}</td>
                        <td>{session.busNumber}</td>
                        <td>{new Date(session.loginTime).toLocaleString()}</td>
                        <td>{session.logoutTime ? new Date(session.logoutTime).toLocaleString() : 'Still Active'}</td>
                        <td>{session.sessionDuration || 'N/A'}</td>
                        <td>
                          <span className={`status ${session.isActive ? 'active' : 'completed'}`}>
                            {session.isActive ? '🟢 Active' : '✅ Completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;