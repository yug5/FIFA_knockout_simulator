import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject adminToken from localStorage if it exists
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['X-Admin-Token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
