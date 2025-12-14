import apiClient from './apiClient';

export async function login(username, password) {
  try {
    const response = await apiClient.post('/api/auth/login', {
      username,
      password
    });
    
    const { token, usuario } = response.data;
    
    // Guardar token y usuario en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    return { token, usuario };
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Error en la autenticación');
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function obtenerUsuarioActual() {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
}

export function obtenerToken() {
  return localStorage.getItem('token');
}

export function estaAutenticado() {
  return !!obtenerToken();
}