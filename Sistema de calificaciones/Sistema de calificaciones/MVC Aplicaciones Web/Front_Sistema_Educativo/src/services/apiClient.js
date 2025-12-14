import axios from 'axios';
import { obtenerToken, logout } from './authService';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL,
});

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use((config) => {
  const token = obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      logout();
      window.location.href = '/login';
    }
    const message = err?.response?.data?.error || err?.response?.data?.mensaje || err.message;
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
