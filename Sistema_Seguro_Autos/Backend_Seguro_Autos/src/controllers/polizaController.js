import { Poliza } from "../models/poliza.js";
import { Cotizacion } from "../models/cotizacion.js";
import { Usuario } from "../models/usuario.js";
import { Vehiculo } from "../models/vehiculo.js";

// Helper para generar numero de poliza unico
const generarNumeroPoliza = () => {
    return 'POL-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

export const crearPoliza = async (req, res) => {
    try {
        const { id_cotizacion, fecha_inicio } = req.body;

        // 1. Validar cotizacion existe
        const cotizacion = await Cotizacion.findByPk(id_cotizacion);
        if (!cotizacion) {
            return res.status(404).json({ message: "Cotización no encontrada" });
        }

        // 2. Validar que la cotizacion esté aprobada (estado = true) y no vencida
        if (!cotizacion.estado) {
            return res.status(400).json({ message: "No se puede crear póliza de una cotización rechazada." });
        }

        // 3. Verificar si ya existe poliza para esta cotizacion
        const existePoliza = await Poliza.findOne({ where: { id_cotizacion } });
        if (existePoliza) {
            return res.status(400).json({ message: "Ya existe una póliza para esta cotización." });
        }

        // 4. Calcular fechas
        // Fecha inicio no puede ser anterior a hoy (regla de pago, simplificada aqui a fecha actual si no se envia)
        const inicio = fecha_inicio ? new Date(fecha_inicio) : new Date();
        const fin = new Date(inicio);
        fin.setFullYear(fin.getFullYear() + 1); // Vigencia de 1 año por defecto

        const nuevaPoliza = await Poliza.create({
            id_cotizacion,
            numero_poliza: generarNumeroPoliza(),
            fecha_inicio: inicio,
            fecha_fin: fin,
            estado: 'Activa',
            observaciones: 'Creación inicial'
        });

        res.status(201).json(nuevaPoliza);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const listarPolizas = async (req, res) => {
    try {
        const polizas = await Poliza.findAll({
            include: [
                {
                    model: Cotizacion,
                    include: [Usuario, Vehiculo] // Traer datos anidados utiles
                }
            ]
        });
        res.json(polizas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const buscarPolizaId = async (req, res) => {
    try {
        const { id } = req.params;
        const poliza = await Poliza.findByPk(id, {
            include: [{ model: Cotizacion, include: [Usuario, Vehiculo] }]
        });
        if (!poliza) {
            return res.status(404).json({ message: "Póliza no encontrada" });
        }
        res.json(poliza);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const actualizarEstadoPoliza = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observaciones } = req.body; // Activa, Cancelada, Suspendida

        const poliza = await Poliza.findByPk(id);
        if (!poliza) {
            return res.status(404).json({ message: "Póliza no encontrada" });
        }

        // Reglas de negocio básicas
        if (poliza.estado === 'Cancelada') {
            return res.status(400).json({ message: "No se puede modificar una póliza cancelada." });
        }

        poliza.estado = estado;
        if (observaciones) {
            poliza.observaciones = (poliza.observaciones || '') + '; ' + observaciones;
        }

        await poliza.save();
        res.json(poliza);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
