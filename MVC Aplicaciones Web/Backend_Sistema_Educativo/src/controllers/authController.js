import { Usuario } from '../models/usuario.js';

export const loginController = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Usuario y contraseña son requeridos' 
            });
        }

        const usuario = await Usuario.findOne({ 
            where: { username, estado: 'activo' } 
        });

        if (!usuario || usuario.password !== password) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Simular token JWT (en producción usa jwt real)
        const token = Buffer.from(JSON.stringify({ 
            id: usuario.id, 
            username: usuario.username, 
            rol: usuario.rol 
        })).toString('base64');

        res.json({
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const registroController = async (req, res) => {
    try {
        const { username, password, email, rol } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ 
                error: 'Usuario, contraseña y email son requeridos' 
            });
        }

        const usuarioExistente = await Usuario.findOne({ where: { username } });
        if (usuarioExistente) {
            return res.status(409).json({ 
                error: 'El usuario ya existe' 
            });
        }

        const nuevoUsuario = await Usuario.create({
            username,
            password, // En producción: hashear con bcrypt
            email,
            rol: rol || 'estudiante',
            estado: 'activo'
        });

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario.id,
                username: nuevoUsuario.username,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerPerfilController = async (req, res) => {
    try {
        const usuarioId = req.usuario?.id;
        
        if (!usuarioId) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const usuario = await Usuario.findByPk(usuarioId);
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol,
            estado: usuario.estado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
