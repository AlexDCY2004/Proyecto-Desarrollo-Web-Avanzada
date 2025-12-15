import { Cotizacion } from "../models/cotizacion.js";
import { Usuario } from "../models/usuario.js";
import { Conductor } from "../models/conductor.js";
import { Vehiculo } from "../models/vehiculo.js";
import { MetodoPago } from "../models/metodoPago.js";

// Crear cotización
export const crearCotizacion = async (req, res) => {
    try {
        const { id_usuario, id_conductor, id_vehiculo, id_pago } = req.body;

        if (id_usuario == null || id_conductor == null || id_vehiculo == null || id_pago == null) {
            return res.status(400).json({ mensaje: "Faltan datos requeridos: id_usuario, id_conductor, id_vehiculo o id_pago" });
        }

        // Validar que existan las entidades relacionadas
        const usuario = await Usuario.findByPk(id_usuario);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const conductor = await Conductor.findByPk(id_conductor);
        if (!conductor) {
            return res.status(404).json({ mensaje: "Conductor no encontrado" });
        }

        const vehiculo = await Vehiculo.findByPk(id_vehiculo);
        if (!vehiculo) {
            return res.status(404).json({ mensaje: "Vehículo no encontrado" });
        }

        const metodoPago = await MetodoPago.findByPk(id_pago);
        if (!metodoPago) {
            return res.status(404).json({ mensaje: "Método de pago no encontrado" });
        }

        const nuevo = await Cotizacion.create({
            id_usuario,
            id_conductor,
            id_vehiculo,
            id_pago,
            fecha_emision: new Date(),
            fecha_caducidad: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
        });

        res.status(201).json(nuevo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Listar todas las cotizaciones
export const listarCotizaciones = async (req, res) => {
    try {
        const cotizaciones = await Cotizacion.findAll({
            include: [Usuario, Conductor, Vehiculo, MetodoPago]
        });
        res.json(cotizaciones);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar las cotizaciones", error: error.message });
    }
};

// Buscar cotización por ID
export const buscarCotizacionId = async (req, res) => {
    try {
        const cotizacion = await Cotizacion.findByPk(req.params.id, {
            include: [Usuario, Conductor, Vehiculo, MetodoPago]
        });
        if (!cotizacion) {
            return res.status(404).json({ mensaje: "Cotización no encontrada" });
        }
        res.json(cotizacion);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar la cotización", error: error.message });
    }
};

// Actualizar cotización
export const actualizarCotizacion = async (req, res) => {
    try {
        const cotizacion = await Cotizacion.findByPk(req.params.id);
        if (!cotizacion) {
            return res.status(404).json({ mensaje: "Cotización no encontrada para actualizar" });
        }

        const { id_usuario, id_conductor, id_vehiculo, id_pago, costo_base, descuento, recargo, costo_final, estado, motivo_rechazo, fecha_caducidad } = req.body;

        if (id_usuario == null && id_conductor == null && id_vehiculo == null && id_pago == null &&
            costo_base == null && descuento == null && recargo == null && costo_final == null &&
            estado == null && motivo_rechazo == null && fecha_caducidad == null) {
            return res.status(400).json({ mensaje: "No hay campos válidos para actualizar" });
        }

        const updates = {};
        if (id_usuario != null) updates.id_usuario = id_usuario;
        if (id_conductor != null) updates.id_conductor = id_conductor;
        if (id_vehiculo != null) updates.id_vehiculo = id_vehiculo;
        if (id_pago != null) updates.id_pago = id_pago;
        if (costo_base != null) updates.costo_base = costo_base;
        if (recargo != null) updates.recargo = recargo;
        if (descuento != null) updates.descuento = descuento;
        if (costo_final != null) updates.costo_final = costo_final;
        if (estado != null) updates.estado = estado;
        if (motivo_rechazo != null) updates.motivo_rechazo = motivo_rechazo;
        if (fecha_caducidad != null) updates.fecha_caducidad = fecha_caducidad;

        await cotizacion.update(updates);
        return res.json(cotizacion);
    } catch (err) {
        console.error("actualizarCotizacion error:", err);
        return res.status(500).json({ mensaje: "Error al actualizar la cotización", error: err.message });
    }
};

// Eliminar cotización
export const eliminarCotizacion = async (req, res) => {
    try {
        const cotizacion = await Cotizacion.findByPk(req.params.id);
        if (!cotizacion) {
            return res.status(404).json({ mensaje: "Cotización no encontrada para eliminar" });
        }

        await cotizacion.destroy();
        res.json({ mensaje: "Cotización eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la cotización", error: error.message });
    }
};

export const cambiarEstadoCotizacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, motivo_rechazo } = req.body; // 'Aprobada' o 'Rechazada'

        if (!['Aprobada', 'Rechazada', 'Pendiente'].includes(estado)) {
            return res.status(400).json({ message: "Estado inválido. Use: Aprobada, Rechazada, Pendiente" });
        }

        const cotizacion = await Cotizacion.findByPk(id);
        if (!cotizacion) {
            return res.status(404).json({ message: "Cotización no encontrada" });
        }

        cotizacion.estado = estado;
        if (estado === 'Rechazada' && motivo_rechazo) {
            cotizacion.motivo_rechazo = motivo_rechazo;
        }

        // Usamos save({ hooks: false }) si quisieramos evitar re-validaciones, 
        // pero aqui esta bien que valide tipos.
        // OJO: El hook beforeValidate puede sobrescribir el estado si recalculamos.
        // Para cambio de estado Manual, mejor update directo.
        await cotizacion.update({ estado, motivo_rechazo });

        res.json(cotizacion);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
