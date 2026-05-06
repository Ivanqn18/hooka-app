import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate axios instance for refresh to avoid interceptor loops
const refreshApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for easy error handling + auto-refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshApi.post('/auth/refresh');
        // Refresh succeeded, retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, reject with original error
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
