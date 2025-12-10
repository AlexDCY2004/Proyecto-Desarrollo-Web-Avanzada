const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'tu_clave_secreta_super_segura_2024';
const DATA_FILE = path.join(__dirname, 'data', 'usuarios.json');

app.use(cors());
app.use(express.json());

// Función para leer datos del JSON
async function leerDatos() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo datos:', error);
    return { usuarios: [], estudiantes: [], docentes: [], notas: [] };
  }
}

// Función para guardar datos en el JSON
async function guardarDatos(datos) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(datos, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error guardando datos:', error);
    return false;
  }
}

// RUTA: Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  const datos = await leerDatos();
  const usuario = datos.usuarios.find(u => u.username === username);
  
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  if (!usuario.activo) {
    return res.status(403).json({ error: 'Usuario inactivo' });
  }

  const passwordValido = bcrypt.compareSync(password, usuario.password);
  
  if (!passwordValido) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  // Generar token JWT
  const token = jwt.sign(
    { 
      id: usuario.id, 
      username: usuario.username, 
      rol: usuario.rol 
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  // No enviar la contraseña al frontend
  const { password: _, ...usuarioSinPassword } = usuario;

  res.json({
    token,
    usuario: usuarioSinPassword
  });
});

// RUTA: Registrar nuevo usuario
app.post('/api/auth/registro', async (req, res) => {
  const { username, password, rol, nombre, email, cedula } = req.body;

  if (!username || !password || !rol || !nombre) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const datos = await leerDatos();

  // Verificar si el usuario ya existe
  if (datos.usuarios.find(u => u.username === username)) {
    return res.status(409).json({ error: 'El usuario ya existe' });
  }

  if (datos.usuarios.find(u => u.email === email)) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  // Crear nuevo usuario
  const nuevoId = datos.usuarios.length > 0 
    ? Math.max(...datos.usuarios.map(u => u.id)) + 1 
    : 1;

  const nuevoUsuario = {
    id: nuevoId,
    username,
    password: bcrypt.hashSync(password, 10),
    rol,
    nombre,
    email: email || null,
    cedula: cedula || null,
    activo: true,
    fechaRegistro: new Date().toISOString()
  };

  datos.usuarios.push(nuevoUsuario);
  await guardarDatos(datos);

  const { password: _, ...usuarioSinPassword } = nuevoUsuario;
  res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: usuarioSinPassword });
});

// Middleware para verificar token
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// RUTA: Obtener perfil del usuario actual
app.get('/api/auth/perfil', verificarToken, async (req, res) => {
  const datos = await leerDatos();
  const usuario = datos.usuarios.find(u => u.id === req.usuario.id);
  
  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { password: _, ...usuarioSinPassword } = usuario;
  res.json(usuarioSinPassword);
});

// RUTA: Listar todos los usuarios (solo admin)
app.get('/api/usuarios', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para esta acción' });
  }

  const datos = await leerDatos();
  const usuariosSinPassword = datos.usuarios.map(({ password, ...resto }) => resto);
  res.json(usuariosSinPassword);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   ✅ API REST corriendo exitosamente   ║
╠════════════════════════════════════════╣
║   📍 URL: http://localhost:${PORT}      ║
║   📁 Datos: ${DATA_FILE}                 ║
╚════════════════════════════════════════╝
  
Usuarios de prueba:
  - admin / admin123
  - docente1 / doc123
  - estudiante1 / est123
  `);
});