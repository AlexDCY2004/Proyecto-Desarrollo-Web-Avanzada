import { Cotizacion } from "../models/cotizacion.js";
import { Usuario } from "../models/usuario.js";
import { Conductor } from "../models/conductor.js";
import { Vehiculo } from "../models/vehiculo.js";
import { MetodoPago } from "../models/metodoPago.js";

// Crear cotización
export const crearCotizacion = async (req, res) => {
    try {
        const { id_usuario, id_conductor, id_vehiculo, id_pago, acepta_terminos } = req.body;

        // Validaciones de campos requeridos
        if (id_usuario == null || id_conductor == null || id_vehiculo == null || id_pago == null) {
            return res.status(400).json({ mensaje: "Faltan datos requeridos: id_usuario, id_conductor, id_vehiculo o id_pago" });
        }

        if (!acepta_terminos) {
            return res.status(400).json({ mensaje: "Debe aceptar los términos y condiciones" });
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

        // Validación de edad del conductor
        if (conductor.edad < 18) {
            return res.status(403).json({ 
                mensaje: "El conductor es menor de 18 años. No se puede generar cotización.",
                estado: "Rechazada"
            });
        }

        if (conductor.edad > 75) {
            return res.status(403).json({ 
                mensaje: "El conductor es mayor de 75 años. Rechazo automático.",
                estado: "Rechazada"
            });
        }

        const vehiculo = await Vehiculo.findByPk(id_vehiculo);
        if (!vehiculo) {
            return res.status(404).json({ mensaje: "Vehículo no encontrado" });
        }

        // Validación de antigüedad del vehículo
        const anioActual = new Date().getFullYear();
        if (anioActual - vehiculo.anio > 20) {
            return res.status(403).json({ 
                mensaje: "Vehículos con más de 20 años de antigüedad no pueden ser cotizados.",
                estado: "Rechazada"
            });
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
            fecha_caducidad: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            acepta_terminos: true
        });

        console.log("Cotización creada con valores:", {
            id: nuevo.id,
            costo_base: nuevo.costo_base,
            recargo: nuevo.recargo,
            descuento: nuevo.descuento,
            costo_final: nuevo.costo_final,
            estado: nuevo.estado
        });

        // Devolver la cotización completa con datos calculados
        res.status(201).json({
            mensaje: nuevo.estado === 'Rechazada' ? "Cotización rechazada automáticamente" : "Cotización creada exitosamente",
            estado: nuevo.estado,
            costo_base: nuevo.costo_base || 0,
            recargo: nuevo.recargo || 0,
            descuento: nuevo.descuento || 0,
            costo_final: nuevo.costo_final || 0,
            motivo_rechazo: nuevo.motivo_rechazo,
            id: nuevo.id,
            cotizacion: nuevo
        });
    } catch (err) {
        console.error("Error en crearCotizacion:", err);
        
        if (err.name === "SequelizeValidationError") {
            const errores = err.errors.map(e => e.message);
            return res.status(400).json({ mensaje: "Error de validación", errores });
        }
        
        res.status(500).json({ mensaje: "Error interno del servidor", error: err.message });
    }
};

// Listar todas las cotizaciones
export const listarCotizaciones = async (req, res) => {
    try {
        const cotizaciones = await Cotizacion.findAll({
            include: [
                { model: Usuario, attributes: { exclude: ['contrasenia'] } },
                Conductor,
                Vehiculo,
                MetodoPago
            ]
        });
        res.json(cotizaciones);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar las cotizaciones", error: error.message });
    }
};

// Buscar cotización por ID
export const buscarCotizacionId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ mensaje: "ID inválido" });
        }

        const cotizacion = await Cotizacion.findByPk(id, {
            include: [
                { model: Usuario, attributes: { exclude: ['contrasenia'] } },
                Conductor,
                Vehiculo,
                MetodoPago
            ]
        });
        
        if (!cotizacion) {
            return res.status(404).json({ mensaje: "Cotización no encontrada" });
        }

        // Verificar vigencia de cotización
        const hoy = new Date();
        const vencida = cotizacion.fecha_caducidad < hoy;

        res.json({
            cotizacion,
            vencida,
            mensaje: vencida ? "Esta cotización ya ha vencido (máximo 30 días de vigencia)" : null
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar la cotización", error: error.message });
    }
};

// Actualizar cotización
export const actualizarCotizacion = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ mensaje: "ID inválido" });
        }

        const cotizacion = await Cotizacion.findByPk(id);
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
        if (estado != null) {
            if (!['Pendiente', 'Aprobada', 'Rechazada'].includes(estado)) {
                return res.status(400).json({ mensaje: "Estado inválido. Use: Pendiente, Aprobada, Rechazada" });
            }
            updates.estado = estado;
        }
        if (motivo_rechazo != null) updates.motivo_rechazo = motivo_rechazo;
        if (fecha_caducidad != null) updates.fecha_caducidad = fecha_caducidad;

        await cotizacion.update(updates);
        return res.json({
            mensaje: "Cotización actualizada correctamente",
            cotizacion
        });
    } catch (err) {
        console.error("actualizarCotizacion error:", err);
        return res.status(500).json({ mensaje: "Error al actualizar la cotización", error: err.message });
    }
};

// Eliminar cotización
export const eliminarCotizacion = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ mensaje: "ID inválido" });
        }

        const cotizacion = await Cotizacion.findByPk(id);
        if (!cotizacion) {
            return res.status(404).json({ mensaje: "Cotización no encontrada para eliminar" });
        }

        await cotizacion.destroy();
        res.json({ mensaje: "Cotización eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la cotización", error: error.message });
    }
};

// Cambiar estado de cotización
export const cambiarEstadoCotizacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, motivo_rechazo } = req.body;

        if (!['Aprobada', 'Rechazada', 'Pendiente'].includes(estado)) {
            return res.status(400).json({ mensaje: "Estado inválido. Use: Aprobada, Rechazada, Pendiente" });
        }

        const cotizacion = await Cotizacion.findByPk(id);
        if (!cotizacion) {
            return res.status(404).json({ mensaje: "Cotización no encontrada" });
        }

        // Validar que no esté vencida
        const hoy = new Date();
        if (cotizacion.fecha_caducidad < hoy) {
            return res.status(403).json({ 
                mensaje: "La cotización ha vencido. No se puede cambiar su estado.",
                estado: "Rechazada"
            });
        }

        cotizacion.estado = estado;
        if (estado === 'Rechazada' && motivo_rechazo) {
            cotizacion.motivo_rechazo = motivo_rechazo;
        } else if (estado === 'Aprobada') {
            cotizacion.motivo_rechazo = null;
        }

        await cotizacion.save({ hooks: false }); // Evitar re-cálculos

        res.json({
            mensaje: `Cotización ${estado.toLowerCase()} exitosamente`,
            cotizacion
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al cambiar estado", error: error.message });
    }
};
