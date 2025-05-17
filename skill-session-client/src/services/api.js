// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://cj7g8r0lhl.execute-api.eu-north-1.amazonaws.com/Production';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization header for authenticated requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;