import { Vehiculo } from "../models/vehiculo.js";

// Crear vehículo
export const crearVehiculo = async (req, res) => {
    try {
        const { modelo, anio, color, tipo, uso, precio } = req.body;
        if (!modelo || !anio || !color || !tipo || !uso || precio == null) {
            return res.status(400).json({ mensaje: "Faltan datos requeridos: modelo, año, color, tipo, uso o precio" });
        }

        const nuevo = await Vehiculo.create({
            modelo,
            anio,
            color,
            tipo,
            uso,
            precio: parseFloat(precio)
        });

        res.status(201).json(nuevo);
    } catch (err) {
        console.error("Error en crearVehiculo:", err);
        
        if (err.name === "SequelizeValidationError") {
            const errores = err.errors.map(e => e.message);
            return res.status(400).json({ mensaje: "Error de validación", errores });
        }
        
        res.status(500).json({ mensaje: "Error interno del servidor", error: err.message });
    }
};

// Listar todos los vehículos
export const listarVehiculos = async (req, res) => {
    try {
        const vehiculos = await Vehiculo.findAll();
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar los vehículos", error: error.message });
    }
};

// Buscar vehículo por ID
export const buscarVehiculoId = async (req, res) => {
    try {
        const vehiculo = await Vehiculo.findByPk(req.params.id);
        if (!vehiculo) {
            return res.status(404).json({ mensaje: "Vehículo no encontrado" });
        }
        res.json(vehiculo);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar el vehículo", error: error.message });
    }
};

// Actualizar vehículo
export const actualizarVehiculo = async (req, res) => {
    try {
        const vehiculo = await Vehiculo.findByPk(req.params.id);
        if (!vehiculo) {
            return res.status(404).json({ mensaje: "Vehículo no encontrado para actualizar" });
        }

        const { modelo, color, tipo, uso, precio } = req.body;

        if (modelo == null && color == null && tipo == null && uso == null && precio == null) {
            return res.status(400).json({ mensaje: "No hay campos válidos para actualizar" });
        }

        const updates = {};
        if (modelo != null) updates.modelo = modelo;
        if (color != null) updates.color = color;
        if (tipo != null) updates.tipo = tipo;
        if (uso != null) updates.uso = uso;
        if (precio != null) updates.precio = precio;

        await vehiculo.update(updates);
        return res.json(vehiculo);
    } catch (err) {
        console.error("actualizarVehiculo error:", err);
        return res.status(500).json({ mensaje: "Error al actualizar el vehículo", error: err.message });
    }
};

// Eliminar vehículo
export const eliminarVehiculo = async (req, res) => {
    try {
        const vehiculo = await Vehiculo.findByPk(req.params.id);
        if (!vehiculo) {
            return res.status(404).json({ mensaje: "Vehículo no encontrado para eliminar" });
        }

        await vehiculo.destroy();
        res.json({ mensaje: "Vehículo eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el vehículo", error: error.message });
    }
};
