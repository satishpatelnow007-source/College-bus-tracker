// Authentication utility functions
export const authUtils = {
  // Save user data to localStorage
  saveUser: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  },

  // Get user data from localStorage
  getUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Check user role
  getUserRole: () => {
    const user = authUtils.getUser();
    return user ? user.role : null;
  },

  // Check if user is admin
  isAdmin: () => {
    return authUtils.getUserRole() === 'admin';
  },

  // Check if user is driver
  isDriver: () => {
    return authUtils.getUserRole() === 'driver';
  },

  // Check if user is student or faculty
  isStudent: () => {
    const role = authUtils.getUserRole();
    return role === 'student' || role === 'faculty';
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  },

  // Get user display name
  getUserName: () => {
    const user = authUtils.getUser();
    return user ? user.name : 'User';
  },

  // Get user email
  getUserEmail: () => {
    const user = authUtils.getUser();
    return user ? user.email : '';
  },
};

export default authUtils;