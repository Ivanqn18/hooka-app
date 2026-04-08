import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    // Handle global errors if needed (e.g., redirect to login on 401)
    return Promise.reject(error);
  }
);

export default api;
