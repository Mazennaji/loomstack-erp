import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const publicPaths = ['/login', '/register', '/'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);