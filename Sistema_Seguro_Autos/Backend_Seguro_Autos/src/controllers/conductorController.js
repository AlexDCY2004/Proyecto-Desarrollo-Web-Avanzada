import { Conductor } from "../models/conductor.js";
import { Usuario } from "../models/usuario.js";

// Crear conductor
export const crearConductor = async (req, res) => {
    try {
        const { id_usuario, nombre, apellido, edad, tipo_licencia, telefono, accidentes_cantidad} = req.body;
        if (!id_usuario || !nombre || !apellido || edad == null || !tipo_licencia || !telefono || accidentes_cantidad == null) {
            return res.status(400).json({ mensaje: "Faltan datos requeridos: id_usuario, nombre, apellido, edad, tipo_licencia, telefono o accidentes_cantidad" });
        }

        // Validar que el usuario existe
        const usuario = await Usuario.findByPk(id_usuario);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const nuevo = await Conductor.create({
            id_usuario,
            nombre,
            apellido,
            edad,
            tipo_licencia,
            telefono,
            accidentes_cantidad
        });

        res.status(201).json(nuevo);
    } catch (err) {
        console.error("Error en crearConductor:", err);
        
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ mensaje: "El ID del conductor ya existe" });
        }
        
        if (err.name === "SequelizeValidationError") {
            const errores = err.errors.map(e => e.message);
            return res.status(400).json({ mensaje: "Error de validación", errores });
        }
        
        res.status(500).json({ mensaje: "Error interno del servidor", error: err.message });
    }
};

// Listar todos los conductores
export const listarConductores = async (req, res) => {
    try {
        const conductores = await Conductor.findAll({
            include: [Usuario]
        });
        res.json(conductores);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar los conductores", error: error.message });
    }
};

// Buscar conductor por ID
export const buscarConductorId = async (req, res) => {
    try {
        const conductor = await Conductor.findByPk(req.params.id, {
            include: [Usuario]
        });
        if (!conductor) {
            return res.status(404).json({ mensaje: "Conductor no encontrado" });
        }
        res.json(conductor);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar el conductor", error: error.message });
    }
};

// Actualizar conductor
export const actualizarConductor = async (req, res) => {
    try {
        const conductor = await Conductor.findByPk(req.params.id);
        if (!conductor) {
            return res.status(404).json({ mensaje: "Conductor no encontrado para actualizar" });
        }

        const { nombre, apellido, edad, tipo_licencia, telefono, accidentes_cantidad, id_usuario } = req.body;

        if (nombre == null && apellido == null && edad == null && tipo_licencia == null && telefono == null && accidentes_cantidad == null && id_usuario == null) {
            return res.status(400).json({ mensaje: "No hay campos válidos para actualizar" });
        }

        const updates = {};
        if (nombre != null) updates.nombre = nombre;
        if (apellido != null) updates.apellido = apellido;
        if (edad != null) updates.edad = edad;
        if (tipo_licencia != null) updates.tipo_licencia = tipo_licencia;
        if (telefono != null) updates.telefono = telefono;
        if (accidentes_cantidad != null) updates.accidentes_cantidad = accidentes_cantidad;
        if (id_usuario != null) updates.id_usuario = id_usuario;

        await conductor.update(updates);
        return res.json(conductor);
    } catch (err) {
        console.error("actualizarConductor error:", err);
        return res.status(500).json({ mensaje: "Error al actualizar el conductor", error: err.message });
    }
};

// Eliminar conductor
export const eliminarConductor = async (req, res) => {
    try {
        const conductor = await Conductor.findByPk(req.params.id);
        if (!conductor) {
            return res.status(404).json({ mensaje: "Conductor no encontrado para eliminar" });
        }

        await conductor.destroy();
        res.json({ mensaje: "Conductor eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el conductor", error: error.message });
    }
};
