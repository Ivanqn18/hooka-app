import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for easy error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
