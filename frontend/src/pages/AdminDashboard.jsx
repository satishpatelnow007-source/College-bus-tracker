
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import "../styles/AdminDashboard.css";

const initialDriverForm = {
  name: "",
  driverId: "",
  busNumber: "",
  password: "",
  phone: "",
};

const initialRouteForm = {
  routeName: "",
  startPoint: { name: "" },
  endPoint: { name: "" },
  stops: [],
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});

  const [drivers, setDrivers] = useState([]);
  const [driverForm, setDriverForm] = useState(initialDriverForm);
  const [editingDriver, setEditingDriver] = useState(null);

  const [routes, setRoutes] = useState([]);
  const [routeForm, setRouteForm] = useState(initialRouteForm);
  const [editingRoute, setEditingRoute] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "info",
  });

  const [driverSessions, setDriverSessions] = useState([]);
  const [analyticsFilter, setAnalyticsFilter] = useState({
    startDate: "",
    endDate: "",
    driverId: "",
  });

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  // Fetch data when switching tabs
  useEffect(() => {
    if (activeTab === "drivers") {
      fetchDrivers();
    } else if (activeTab === "routes") {
      fetchRoutes();
    } else if (activeTab === "notifications") {
      fetchNotifications();
    } else if (activeTab === "analytics") {
      fetchDriverSessions();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data.stats || {});
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/admin/drivers");

      const allDrivers = response.data.drivers || [];
      const activeDrivers = allDrivers.filter(
        (driver) => driver.isActive !== false
      );

      setDrivers(activeDrivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await api.get("/admin/routes");

      const allRoutes = response.data.routes || [];
      const activeRoutes = allRoutes.filter(
        (route) => route.isActive !== false
      );

      setRoutes(activeRoutes);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/admin/notifications");
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchDriverSessions = async () => {
    try {
      const params = new URLSearchParams();

      if (analyticsFilter.startDate) {
        params.append("startDate", analyticsFilter.startDate);
      }

      if (analyticsFilter.endDate) {
        params.append("endDate", analyticsFilter.endDate);
      }

      if (analyticsFilter.driverId) {
        params.append("driverId", analyticsFilter.driverId);
      }

      const response = await api.get(
        `/admin/analytics/driver-sessions?${params.toString()}`
      );

      setDriverSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Error fetching driver sessions:", error);
    }
  };

  // Driver Management
  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDriver) {
        await api.put(
          `/admin/drivers/${editingDriver._id}`,
          driverForm
        );
        alert("Driver updated successfully!");
      } else {
        await api.post("/admin/drivers", driverForm);
        alert("Driver created successfully!");
      }

      setDriverForm(initialDriverForm);
      setEditingDriver(null);

      await fetchDrivers();
      await fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving driver");
    } finally {
      setLoading(false);
    }
  };

  const startEditingDriver = (driver) => {
    setEditingDriver(driver);

    setDriverForm({
      name: driver.name || "",
      driverId: driver.driverId || "",
      busNumber: driver.busNumber || "",
      password: "",
      phone: driver.phone || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelDriverEdit = () => {
    setEditingDriver(null);
    setDriverForm(initialDriverForm);
  };

  const deleteDriver = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) {
      return;
    }

    try {
      await api.delete(`/admin/drivers/${id}`);
      alert("Driver deleted successfully!");

      await fetchDrivers();
      await fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting driver");
    }
  };

  // Route Management
  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRoute) {
        await api.put(
          `/admin/routes/${editingRoute._id}`,
          routeForm
        );
        alert("Route updated successfully!");
      } else {
        await api.post("/admin/routes", routeForm);
        alert("Route created successfully!");
      }

      setRouteForm(initialRouteForm);
      setEditingRoute(null);

      await fetchRoutes();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving route");
    } finally {
      setLoading(false);
    }
  };

  const startEditingRoute = (route) => {
    setEditingRoute(route);

    setRouteForm({
      routeName: route.routeName || "",
      startPoint: route.startPoint || { name: "" },
      endPoint: route.endPoint || { name: "" },
      stops: route.stops || [],
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelRouteEdit = () => {
    setEditingRoute(null);
    setRouteForm(initialRouteForm);
  };

  const deleteRoute = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) {
      return;
    }

    try {
      await api.delete(`/admin/routes/${id}`);
      alert("Route deleted successfully!");
      await fetchRoutes();
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting route");
    }
  };

  // Notification Management
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/admin/notifications", notificationForm);

      alert("Notification sent successfully!");

      setNotificationForm({
        title: "",
        message: "",
        type: "info",
      });

      await fetchNotifications();
    } catch (error) {
      alert(error.response?.data?.message || "Error sending notification");
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      await api.delete(`/admin/notifications/${id}`);
      alert("Notification deleted successfully!");
      await fetchNotifications();
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting notification");
    }
  };

  // Analytics
  const resetAnalytics = async () => {
    const confirmed = window.confirm(
      "Reset analytics data? This will permanently delete all driver session records."
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      await api.post("/admin/analytics/reset");

      setDriverSessions([]);
      await fetchDashboardData();

      alert("Analytics data reset successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error resetting analytics");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login", { replace: true });
  };

  // Stop Editor
  const StopEditor = ({ stops = [], onChange }) => {
    const [name, setName] = useState("");
    const [estimatedTime, setEstimatedTime] = useState("");

    const addStop = () => {
      if (!name.trim()) return;

      const newStops = [
        ...stops,
        {
          name: name.trim(),
          estimatedTime: estimatedTime.trim(),
        },
      ];

      onChange(newStops);
      setName("");
      setEstimatedTime("");
    };

    const removeStop = (index) => {
      onChange(stops.filter((_, i) => i !== index));
    };

    return (
      <div className="stop-editor">
        <div>
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

          <button type="button" onClick={addStop}>
            Add Stop
          </button>
        </div>

        <div className="stops-list">
          {stops.length > 0 ? (
            stops.map((stop, index) => (
              <div key={index} className="stop-item">
                <div>
                  <strong>{stop.name}</strong>
                  {stop.estimatedTime && (
                    <span> — {stop.estimatedTime}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeStop(index)}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <small>No stops added</small>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>

        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </header>

      <nav className="admin-nav">
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={activeTab === "drivers" ? "active" : ""}
          onClick={() => setActiveTab("drivers")}
        >
          Drivers
        </button>

        <button
          className={activeTab === "routes" ? "active" : ""}
          onClick={() => setActiveTab("routes")}
        >
          Routes
        </button>

        <button
          className={activeTab === "notifications" ? "active" : ""}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>

        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </nav>

      <main className="admin-content">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <section className="dashboard-overview">
            <h2>System Overview</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Drivers</h3>
                <p>{stats.totalDrivers || 0}</p>
              </div>

              <div className="stat-card">
                <h3>Total Routes</h3>
                <p>{stats.totalRoutes || 0}</p>
              </div>
            </div>
          </section>
        )}

        {/* Driver Management */}
        {activeTab === "drivers" && (
          <section className="drivers-section">
            <h2>Driver Management</h2>

            <form
              onSubmit={handleDriverSubmit}
              className="driver-form"
            >
              <h3>{editingDriver ? "Edit Driver" : "Add New Driver"}</h3>

              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Driver Name"
                  value={driverForm.name}
                  onChange={(e) =>
                    setDriverForm({
                      ...driverForm,
                      name: e.target.value,
                    })
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Driver ID"
                  value={driverForm.driverId}
                  onChange={(e) =>
                    setDriverForm({
                      ...driverForm,
                      driverId: e.target.value,
                    })
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Bus Number"
                  value={driverForm.busNumber}
                  onChange={(e) =>
                    setDriverForm({
                      ...driverForm,
                      busNumber: e.target.value,
                    })
                  }
                  required
                />

                <input
                  type="password"
                  placeholder={
                    editingDriver
                      ? "New Password (leave blank to keep current)"
                      : "Password"
                  }
                  value={driverForm.password}
                  onChange={(e) =>
                    setDriverForm({
                      ...driverForm,
                      password: e.target.value,
                    })
                  }
                  required={!editingDriver}
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={driverForm.phone}
                  onChange={(e) =>
                    setDriverForm({
                      ...driverForm,
                      phone: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : editingDriver
                    ? "Update Driver"
                    : "Add Driver"}
                </button>

                {editingDriver && (
                  <button
                    type="button"
                    onClick={cancelDriverEdit}
                  >
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
                    {drivers.map((driver) => (
                      <tr key={driver._id}>
                        <td>{driver.name}</td>
                        <td>{driver.driverId}</td>
                        <td>{driver.busNumber}</td>
                        <td>{driver.phone}</td>

                        <td>
                          <span
                            className={`status ${
                              driver.isOnline ? "online" : "offline"
                            }`}
                          >
                            {driver.isOnline ? "Online" : "Offline"}
                          </span>
                        </td>

                        <td>
                          <button
                            onClick={() => startEditingDriver(driver)}
                            className="edit-btn"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteDriver(driver._id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {drivers.length === 0 && (
                      <tr>
                        <td colSpan="6">No drivers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Route Management */}
        {activeTab === "routes" && (
          <section className="routes-section">
            <h2>Route Management</h2>

            <form
              onSubmit={handleRouteSubmit}
              className="route-form"
            >
              <h3>{editingRoute ? "Edit Route" : "Add New Route"}</h3>

              <input
                type="text"
                placeholder="Route Name"
                value={routeForm.routeName}
                onChange={(e) =>
                  setRouteForm({
                    ...routeForm,
                    routeName: e.target.value,
                  })
                }
                required
              />

              <div className="location-inputs">
                <h4>Start Point</h4>

                <input
                  type="text"
                  placeholder="Start Point Name"
                  value={routeForm.startPoint.name}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      startPoint: {
                        ...routeForm.startPoint,
                        name: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>

              <div className="location-inputs">
                <h4>End Point</h4>

                <input
                  type="text"
                  placeholder="End Point Name"
                  value={routeForm.endPoint.name}
                  onChange={(e) =>
                    setRouteForm({
                      ...routeForm,
                      endPoint: {
                        ...routeForm.endPoint,
                        name: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>

              <div className="stops-input">
                <h4>Stops (between start and end)</h4>

                <StopEditor
                  stops={routeForm.stops}
                  onChange={(stops) =>
                    setRouteForm({
                      ...routeForm,
                      stops,
                    })
                  }
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : editingRoute
                    ? "Update Route"
                    : "Add Route"}
                </button>

                {editingRoute && (
                  <button
                    type="button"
                    onClick={cancelRouteEdit}
                  >
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
                    {routes.map((route) => (
                      <tr key={route._id}>
                        <td>{route.routeName}</td>

                        <td>
                          {route.startPoint?.name}

                          {route.stops?.length > 0 && (
                            <span>
                              {" → "}
                              {route.stops
                                .map((stop) => stop.name)
                                .join(" → ")}
                            </span>
                          )}

                          <span> → {route.endPoint?.name}</span>
                        </td>

                        <td>
                          <button
                            onClick={() => startEditingRoute(route)}
                            className="edit-btn"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteRoute(route._id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {routes.length === 0 && (
                      <tr>
                        <td colSpan="3">No routes found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Notification Management */}
        {activeTab === "notifications" && (
          <section className="notifications-section">
            <h2>Notification Management</h2>

            <form
              onSubmit={handleNotificationSubmit}
              className="notification-form"
            >
              <h3>Send New Notification</h3>

              <input
                type="text"
                placeholder="Notification Title"
                value={notificationForm.title}
                onChange={(e) =>
                  setNotificationForm({
                    ...notificationForm,
                    title: e.target.value,
                  })
                }
                required
              />

              <textarea
                placeholder="Notification Message"
                value={notificationForm.message}
                onChange={(e) =>
                  setNotificationForm({
                    ...notificationForm,
                    message: e.target.value,
                  })
                }
                rows="4"
                required
              />

              <select
                value={notificationForm.type}
                onChange={(e) =>
                  setNotificationForm({
                    ...notificationForm,
                    type: e.target.value,
                  })
                }
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
                <option value="announcement">Announcement</option>
              </select>

              <button
                className="my-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Notification"}
              </button>
            </form>

            <div className="notifications-list">
              <h3>Recent Notifications</h3>

              <div className="notifications-container">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-card ${notification.type}`}
                  >
                    <div className="notification-header">
                      <h4>{notification.title}</h4>
                      <span className="notification-type">
                        {notification.type}
                      </span>
                    </div>

                    <p>{notification.message}</p>

                    <div className="notification-footer">
                      <small>
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </small>

                      <button
                        onClick={() =>
                          deleteNotification(notification._id)
                        }
                        className="delete-btn small"
                        aria-label="Delete notification"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <p>No notifications found.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <section className="analytics-section">
            <div className="sessions-list">
              <div>
                <h3>Driver Sessions</h3>

                <button
                  type="button"
                  className="danger-btn my-btn"
                  onClick={resetAnalytics}
                  disabled={loading}
                >
                  {loading ? "Please wait..." : "Reset Analytics"}
                </button>
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
                    {driverSessions.map((session) => (
                      <tr key={session._id}>
                        <td>{session.driverName}</td>
                        <td>{session.busNumber}</td>

                        <td>
                          {new Date(
                            session.loginTime
                          ).toLocaleString()}
                        </td>

                        <td>
                          {session.logoutTime
                            ? new Date(
                                session.logoutTime
                              ).toLocaleString()
                            : "Still Active"}
                        </td>

                        <td>{session.sessionDuration ?? "N/A"}</td>

                        <td>
                          <span
                            className={`status ${
                              session.isActive ? "active" : "completed"
                            }`}
                          >
                            {session.isActive ? "Active" : "Completed"}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {driverSessions.length === 0 && (
                      <tr>
                        <td colSpan="6">No driver sessions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
