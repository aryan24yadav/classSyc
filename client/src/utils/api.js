import axios from 'axios';
import { API_ENDPOINTS } from './constants';

// Fired when the server rejects our token, so AuthContext can log the user out
export const AUTH_EXPIRED_EVENT = 'auth:expired';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on a protected route means the token is missing, invalid or expired.
// (A 401 from login just means wrong credentials, so it is left alone.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isLoginOrRegister = url.includes(API_ENDPOINTS.AUTH.LOGIN) || url.includes(API_ENDPOINTS.AUTH.REGISTER);

    if (error.response?.status === 401 && !isLoginOrRegister) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

export default api;
