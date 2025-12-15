import { Usuario } from "../models/usuario.js";
import { Op } from "sequelize";

// Crear usuario
export const crearUsuario = async (req, res) => {
    try {
        const { nombre, contrasenia, estado } = req.body;

        // Validaciones adicionales
        if (!nombre || !contrasenia) {
            return res.status(400).json({ mensaje: "Faltan datos requeridos: nombre o contraseña" });
        }

        if (nombre.length < 3 || nombre.length > 32) {
            return res.status(400).json({ mensaje: "El nombre debe tener entre 3 y 32 caracteres" });
        }

        if (contrasenia.length < 8) {
            return res.status(400).json({ mensaje: "La contraseña debe tener mínimo 8 caracteres" });
        }

        if (contrasenia.includes(' ')) {
            return res.status(400).json({ mensaje: "La contraseña no puede contener espacios" });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ where: { nombre } });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: "El nombre de usuario ya está registrado" });
        }

        const nuevo = await Usuario.create({
            nombre,
            contrasenia,
            estado: estado !== undefined ? estado : true
        });

        res.status(201).json(nuevo);
    } catch (err) {
        console.error("Error en crearUsuario:", err);
        res.status(500).json({ error: err.message });
    }
};

// Listar todos los usuarios
export const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['contrasenia'] } // No devolver contraseñas
        });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar los usuarios", error: error.message });
    }
};

// Buscar usuario por ID
export const buscarUsuarioId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ mensaje: "ID inválido" });
        }

        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ['contrasenia'] }
        });
        
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
        
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar el usuario", error: error.message });
    }
};

// Actualizar usuario
export const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ mensaje: "ID inválido" });
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado para actualizar" });
        }

        const { nombre, contrasenia, estado } = req.body;

        if (nombre == null && contrasenia == null && estado == null) {
            return res.status(400).json({ mensaje: "No hay campos válidos para actualizar" });
        }

        const updates = {};
        
        if (nombre != null) {
            if (nombre.length < 3 || nombre.length > 32) {
                return res.status(400).json({ mensaje: "El nombre debe tener entre 3 y 32 caracteres" });
            }
            const usuarioExistente = await Usuario.findOne({ 
                where: { nombre, id: { [Op.ne]: id } } 
            });
            if (usuarioExistente) {
                return res.status(400).json({ mensaje: "El nombre de usuario ya existe" });
            }
            updates.nombre = nombre;
        }

        if (contrasenia != null) {
            if (contrasenia.length < 8) {
                return res.status(400).json({ mensaje: "La contraseña debe tener mínimo 8 caracteres" });
            }
            if (contrasenia.includes(' ')) {
                return res.status(400).json({ mensaje: "La contraseña no puede contener espacios" });
            }
            updates.contrasenia = contrasenia;
        }

        if (estado != null) {
            updates.estado = estado;
        }

        await usuario.update(updates);
        return res.json({ mensaje: "Usuario actualizado correctamente", usuario });
    } catch (err) {
        console.error("actualizarUsuario error:", err);
        return res.status(500).json({ mensaje: "Error al actualizar el usuario", error: err.message });
    }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ mensaje: "ID inválido" });
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado para eliminar" });
        }

        await usuario.destroy();
        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el usuario", error: error.message });
    }
};

// Login (validación simple)
export const login = async (req, res) => {
    try {
        const { nombre, contrasenia } = req.body;
        
        if (!nombre || !contrasenia) {
            return res.status(400).json({ mensaje: "Nombre y contraseña son requeridos" });
        }

        const usuario = await Usuario.findOne({ where: { nombre } });
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario o contraseña incorrectos" });
        }

        // Validación simple de password
        if (usuario.contrasenia !== contrasenia) {
            return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
        }

        if (!usuario.estado) {
            return res.status(403).json({ mensaje: "Usuario inactivo" });
        }

        res.json({ 
            mensaje: "Login exitoso", 
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                estado: usuario.estado
            }
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error en login", error: error.message });
    }
};
