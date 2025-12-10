const BASE_URL = "http://localhost:5000/api/auth";

export async function login(username, password) {
  try {
    const resp = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!resp.ok) {
      const error = await resp.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    const data = await resp.json();
    
    // Guardar token y usuario en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    
    return data;
  } catch (err) {
    throw err;
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

export async function obtenerPerfil() {
  const token = obtenerToken();
  
  if (!token) throw new Error('No hay sesión activa');

  try {
    const resp = await fetch(`${BASE_URL}/perfil`, {
      headers: { 
        "Authorization": `Bearer ${token}` 
      }
    });

    if (!resp.ok) throw new Error('Token inválido o expirado');

    return await resp.json();
  } catch (err) {
    logout(); // Limpiar sesión si el token es inválido
    throw err;
  }
}