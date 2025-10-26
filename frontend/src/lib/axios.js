import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000/api';

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if user had a token before removing it
      const hadToken = !!localStorage.getItem('token');
      
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to dashboard if:
      // 1. User was previously authenticated (had a token that expired)
      // 2. Not already on dashboard page
      const currentPath = window.location.pathname;
      if (hadToken && currentPath !== '/' && currentPath !== '/dashboard') {
        window.location.href = '/dashboard';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;

