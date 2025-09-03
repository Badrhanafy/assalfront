// src/utils/axiosConfig.js
import axios from 'axios';

// Create axios instance with better defaults
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_ENDPOINT || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response received: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. The server is taking too long to respond.';
    } else if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          errorMessage = 'Authentication failed. Please login again.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = data?.message || `Server returned error: ${status}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      if (error.request.readyState === 4 && error.request.status === 0) {
        errorMessage = 'Cannot connect to the server. Please check: \n1. Laravel server is running\n2. Correct backend URL\n3. Network connectivity';
      } else {
        errorMessage = 'Network error. Please check your internet connection.';
      }
    }
    
    error.message = errorMessage;
    console.error('API Error:', error.message, error);
    
    return Promise.reject(error);
  }
);

// Add a test connection method
axiosInstance.testConnection = async () => {
  try {
    const response = await axiosInstance.get('/api/test-connection', { timeout: 5000 });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default axiosInstance;