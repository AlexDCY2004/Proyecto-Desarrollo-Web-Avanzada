const BASE_URL = "http://localhost:3001";

export async function login(username, password) {
  try {
    // Obtener todos los usuarios del JSON
    const resp = await fetch(`${BASE_URL}/usuarios`);
    const usuarios = await resp.json();
    
    const usuario = usuarios.find(u => u.username === username);
    
    if (!usuario || usuario.password !== password) {
      throw new Error('Credenciales inválidas');
    }

    // Simular token (json-server no tiene auth, así que usamos el ID)
    const token = btoa(JSON.stringify({ id: usuario.id, username: usuario.username }));
    
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    return { token, usuario };
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