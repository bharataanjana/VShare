import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vshare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const BACKEND_URL = 'http://localhost:5000';
export default api;
