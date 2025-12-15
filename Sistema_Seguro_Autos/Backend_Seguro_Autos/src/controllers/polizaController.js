import { Poliza } from "../models/poliza.js";
import { Cotizacion } from "../models/cotizacion.js";
import { Usuario } from "../models/usuario.js";
import { Vehiculo } from "../models/vehiculo.js";
import { Conductor } from "../models/conductor.js";

// Helper para generar numero de poliza unico
const generarNumeroPoliza = () => {
    return 'POL-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

export const crearPoliza = async (req, res) => {
    try {
        const { id_cotizacion, fecha_inicio } = req.body;

        if (!id_cotizacion) {
            return res.status(400).json({ mensaje: "La cotización es requerida" });
        }

        // 1. Validar cotizacion existe
        const cotizacion = await Cotizacion.findByPk(id_cotizacion);
        if (!cotizacion) {
            return res.status(404).json({ mensaje: "Cotización no encontrada" });
        }

        // 2. Validar que la cotizacion esté aprobada
        if (cotizacion.estado !== 'Aprobada') {
            return res.status(400).json({ 
                mensaje: `No se puede crear póliza de una cotización ${cotizacion.estado.toLowerCase()}.`,
                estado: cotizacion.estado
            });
        }

        // 3. Validar que la cotización no esté vencida
        const hoy = new Date();
        if (cotizacion.fecha_caducidad < hoy) {
            return res.status(400).json({ 
                mensaje: "La cotización ha vencido. No se puede crear póliza.",
                vencimiento: cotizacion.fecha_caducidad
            });
        }

        // 4. Verificar si ya existe poliza para esta cotizacion
        const existePoliza = await Poliza.findOne({ where: { id_cotizacion } });
        if (existePoliza) {
            return res.status(400).json({ 
                mensaje: "Ya existe una póliza para esta cotización.",
                poliza_id: existePoliza.id
            });
        }

        // 5. Calcular fechas
        const inicio = fecha_inicio ? new Date(fecha_inicio) : new Date();
        
        // Validar que fecha_inicio no sea anterior a hoy
        if (inicio < hoy) {
            return res.status(400).json({ 
                mensaje: "La fecha de inicio no puede ser anterior a la fecha actual" 
            });
        }

        const fin = new Date(inicio);
        fin.setFullYear(fin.getFullYear() + 1); // Vigencia de 1 año

        const nuevaPoliza = await Poliza.create({
            id_cotizacion,
            numero_poliza: generarNumeroPoliza(),
            fecha_inicio: inicio.toISOString().split('T')[0],
            fecha_fin: fin.toISOString().split('T')[0],
            estado: 'Activa',
            observaciones: 'Póliza creada a partir de cotización aprobada'
        });

        res.status(201).json({
            mensaje: "Póliza creada exitosamente",
            poliza: nuevaPoliza
        });

    } catch (error) {
        console.error("Error en crearPoliza:", error);
        res.status(500).json({ mensaje: "Error al crear la póliza", error: error.message });
    }
};

export const listarPolizas = async (req, res) => {
    try {
        const polizas = await Poliza.findAll({
            include: [
                {
                    model: Cotizacion,
                    include: [Usuario, Vehiculo, Conductor]
                }
            ]
        });
        
        // Agregar información de vigencia
        const polizasConVigencia = polizas.map(p => ({
            ...p.toJSON(),
            vencida: new Date(p.fecha_fin) < new Date(),
            diasRestantes: Math.max(0, Math.ceil((new Date(p.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24)))
        }));

        res.json(polizasConVigencia);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar las pólizas", error: error.message });
    }
};

export const buscarPolizaId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ mensaje: "ID inválido" });
        }

        const poliza = await Poliza.findByPk(id, {
            include: [
                { 
                    model: Cotizacion, 
                    include: [
                        { model: Usuario, attributes: { exclude: ['contrasenia'] } },
                        Vehiculo,
                        Conductor
                    ]
                }
            ]
        });
        
        if (!poliza) {
            return res.status(404).json({ mensaje: "Póliza no encontrada" });
        }

        const vencida = new Date(poliza.fecha_fin) < new Date();
        const diasRestantes = Math.max(0, Math.ceil((new Date(poliza.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24)));

        res.json({
            poliza,
            vencida,
            diasRestantes,
            mensaje: vencida ? "Esta póliza ha vencido" : null
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar la póliza", error: error.message });
    }
};

export const actualizarEstadoPoliza = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observaciones } = req.body;

        if (!['Activa', 'Vencida', 'Cancelada', 'Suspendida'].includes(estado)) {
            return res.status(400).json({ 
                mensaje: "Estado inválido. Use: Activa, Vencida, Cancelada, Suspendida" 
            });
        }

        const poliza = await Poliza.findByPk(id);
        if (!poliza) {
            return res.status(404).json({ mensaje: "Póliza no encontrada" });
        }

        // Reglas de negocio
        if (poliza.estado === 'Cancelada') {
            return res.status(400).json({ 
                mensaje: "No se puede modificar una póliza cancelada." 
            });
        }

        if (poliza.estado === 'Vencida' && estado === 'Activa') {
            return res.status(400).json({ 
                mensaje: "Una póliza vencida no puede reactivarse, solo renovarse." 
            });
        }

        // Validar cambio de vehículo o titular no permitido
        // (esto se validaría si hubiera más campos para actualizar)

        poliza.estado = estado;
        if (observaciones) {
            poliza.observaciones = (poliza.observaciones || '') + ' | ' + observaciones + ` [${new Date().toLocaleString()}]`;
        }

        await poliza.save();

        res.json({
            mensaje: `Póliza actualizada a estado ${estado}`,
            poliza
        });

    } catch (error) {
        console.error("Error en actualizarEstadoPoliza:", error);
        res.status(500).json({ mensaje: "Error al actualizar la póliza", error: error.message });
    }
};

// Renovar póliza
export const renovarPoliza = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_inicio_nueva } = req.body;

        const polizaAntigua = await Poliza.findByPk(id);
        if (!polizaAntigua) {
            return res.status(404).json({ mensaje: "Póliza no encontrada" });
        }

        if (polizaAntigua.estado !== 'Vencida') {
            return res.status(400).json({ 
                mensaje: "Solo se pueden renovar pólizas vencidas" 
            });
        }

        // Obtener la cotización para crear nueva póliza
        const cotizacion = await Cotizacion.findByPk(polizaAntigua.id_cotizacion);
        
        const inicio = fecha_inicio_nueva ? new Date(fecha_inicio_nueva) : new Date();
        const fin = new Date(inicio);
        fin.setFullYear(fin.getFullYear() + 1);

        const nuevaPoliza = await Poliza.create({
            id_cotizacion: polizaAntigua.id_cotizacion,
            numero_poliza: generarNumeroPoliza(),
            fecha_inicio: inicio.toISOString().split('T')[0],
            fecha_fin: fin.toISOString().split('T')[0],
            estado: 'Activa',
            observaciones: `Renovación de póliza ${polizaAntigua.numero_poliza}`
        });

        res.status(201).json({
            mensaje: "Póliza renovada exitosamente",
            poliza_nueva: nuevaPoliza,
            poliza_antigua_id: polizaAntigua.id
        });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al renovar la póliza", error: error.message });
    }
};
