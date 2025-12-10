const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'tu_clave_secreta_super_segura_2024'; // Cambiar en producción

app.use(cors());
app.use(express.json());

// Base de datos simulada (en producción usar MongoDB/PostgreSQL)
const usuarios = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10), // Contraseña hasheada
    rol: 'admin',
    nombre: 'Administrador Sistema'
  },
  {
    id: 2,
    username: 'docente1',
    password: bcrypt.hashSync('doc123', 10),
    rol: 'docente',
    nombre: 'Prof. Juan Pérez'
  },
  {
    id: 3,
    username: 'estudiante1',
    password: bcrypt.hashSync('est123', 10),
    rol: 'estudiante',
    nombre: 'María García'
  }
];

// Ruta de Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  const usuario = usuarios.find(u => u.username === username);
  
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
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

  res.json({
    token,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      nombre: usuario.nombre
    }
  });
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
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Ruta protegida de ejemplo
app.get('/api/auth/perfil', verificarToken, (req, res) => {
  const usuario = usuarios.find(u => u.id === req.usuario.id);
  res.json({
    id: usuario.id,
    username: usuario.username,
    rol: usuario.rol,
    nombre: usuario.nombre
  });
});

app.listen(PORT, () => {
  console.log(`✅ API corriendo en http://localhost:${PORT}`);
});