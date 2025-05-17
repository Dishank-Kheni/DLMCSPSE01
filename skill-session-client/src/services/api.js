import axios from 'axios';

const API_BASE_URL = 'https://cj7g8r0lhl.execute-api.eu-north-1.amazonaws.com/Production';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (unauthorized, server errors, etc.)
    if (error.response) {
      // Specific error handling based on status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.error('Unauthorized access, please login again');
          // Could redirect to login or dispatch a logout action
          break;
        case 403:
          console.error('Forbidden access');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('No response received from server');
    } else {
      // Something else happened
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;