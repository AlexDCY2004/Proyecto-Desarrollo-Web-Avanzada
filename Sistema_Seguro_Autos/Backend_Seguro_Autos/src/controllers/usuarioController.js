import { Usuario } from "../models/usuario.js";

// Crear usuario
export const crearUsuario = async (req, res) => {
    try {
        const { nombre, contrasenia, estado } = req.body;
        if (!nombre || !contrasenia) {
            return res.status(400).json({ mensaje: "Faltan datos requeridos: nombre o contraseña" });
        }

        const nuevo = await Usuario.create({
            nombre,
            contrasenia,
            estado: estado !== undefined ? estado : true
        });

        res.status(201).json(nuevo);
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ mensaje: "El nombre de usuario ya está registrado" });
        }
        res.status(500).json({ error: err.message });
    }
};

// Listar todos los usuarios
export const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar los usuarios", error: error.message });
    }
};

// Buscar usuario por ID
export const buscarUsuarioId = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
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
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado para actualizar" });
        }

        const { nombre, contrasenia, estado } = req.body;

        if (nombre == null && contrasenia == null && estado == null) {
            return res.status(400).json({ mensaje: "No hay campos válidos para actualizar" });
        }

        const updates = {};
        if (nombre != null) updates.nombre = nombre;
        if (contrasenia != null) updates.contrasenia = contrasenia;
        if (estado != null) updates.estado = estado;

        await usuario.update(updates);
        return res.json(usuario);
    } catch (err) {
        console.error("actualizarUsuario error:", err);
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ mensaje: "El nombre de usuario ya existe" });
        }
        return res.status(500).json({ mensaje: "Error al actualizar el usuario", error: err.message });
    }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
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
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Validación simple de password (en producción usar bcrypt)
        if (usuario.contrasenia !== contrasenia) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" });
        }

        if (!usuario.estado) {
            return res.status(403).json({ mensaje: "Usuario inactivo" });
        }

        res.json({ mensaje: "Login exitoso", usuario });
    } catch (error) {
        res.status(500).json({ mensaje: "Error en login", error: error.message });
    }
};
