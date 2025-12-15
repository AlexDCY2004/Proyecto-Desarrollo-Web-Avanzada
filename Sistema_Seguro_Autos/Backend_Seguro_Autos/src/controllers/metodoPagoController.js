import { MetodoPago } from "../models/metodoPago.js";

// Crear método de pago
export const crearMetodoPago = async (req, res) => {
    try {
        const { tipo, estado_validacion } = req.body;
        if (!tipo) {
            return res.status(400).json({ mensaje: "Faltan datos requeridos: tipo" });
        }

        const nuevo = await MetodoPago.create({
            tipo,
            estado_validacion: estado_validacion || 'Pendiente'
        });

        res.status(201).json(nuevo);
    } catch (err) {
        console.error("Error en crearMetodoPago:", err);
        
        if (err.name === "SequelizeValidationError") {
            const errores = err.errors.map(e => e.message);
            return res.status(400).json({ mensaje: "Error de validación", errores });
        }
        
        res.status(500).json({ mensaje: "Error interno del servidor", error: err.message });
    }
};

// Listar todos los métodos de pago
export const listarMetodosPago = async (req, res) => {
    try {
        const metodosPago = await MetodoPago.findAll();
        res.json(metodosPago);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar los métodos de pago", error: error.message });
    }
};

// Buscar método de pago por ID
export const buscarMetodoPagoId = async (req, res) => {
    try {
        const metodoPago = await MetodoPago.findByPk(req.params.id);
        if (!metodoPago) {
            return res.status(404).json({ mensaje: "Método de pago no encontrado" });
        }
        res.json(metodoPago);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar el método de pago", error: error.message });
    }
};

// Actualizar método de pago
export const actualizarMetodoPago = async (req, res) => {
    try {
        const metodoPago = await MetodoPago.findByPk(req.params.id);
        if (!metodoPago) {
            return res.status(404).json({ mensaje: "Método de pago no encontrado para actualizar" });
        }

        const { tipo, estado_validacion } = req.body;

        if (tipo == null && estado_validacion == null) {
            return res.status(400).json({ mensaje: "No hay campos válidos para actualizar" });
        }

        const updates = {};
        if (tipo != null) updates.tipo = tipo;
        if (estado_validacion != null) updates.estado_validacion = estado_validacion;

        await metodoPago.update(updates);
        return res.json(metodoPago);
    } catch (err) {
        console.error("actualizarMetodoPago error:", err);
        return res.status(500).json({ mensaje: "Error al actualizar el método de pago", error: err.message });
    }
};

// Eliminar método de pago
export const eliminarMetodoPago = async (req, res) => {
    try {
        const metodoPago = await MetodoPago.findByPk(req.params.id);
        if (!metodoPago) {
            return res.status(404).json({ mensaje: "Método de pago no encontrado para eliminar" });
        }

        await metodoPago.destroy();
        res.json({ mensaje: "Método de pago eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el método de pago", error: error.message });
    }
};
