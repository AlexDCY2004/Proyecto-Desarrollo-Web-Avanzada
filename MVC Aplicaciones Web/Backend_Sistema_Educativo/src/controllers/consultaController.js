import { Consulta } from '../models/consulta.js';
import { Usuario } from '../models/usuario.js';

// Crear consulta/ticket de ayuda
export const crearConsulta = async (req, res) => {
    try {
        const { nombre, email, asunto, mensaje, tipo, usuarioId } = req.body;

        if (!nombre || !email || !asunto || !mensaje) {
            return res.status(400).json({ 
                error: 'Nombre, email, asunto y mensaje son requeridos' 
            });
        }

        const nuevaConsulta = await Consulta.create({
            nombre,
            email,
            asunto,
            mensaje,
            tipo: tipo || 'consulta',
            usuarioId: usuarioId || null,
            estado: 'pendiente'
        });

        res.status(201).json({
            mensaje: 'Consulta registrada exitosamente. Te responderemos pronto.',
            consulta: nuevaConsulta
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Listar todas las consultas
export const listarConsultas = async (req, res) => {
    try {
        const { estado, tipo } = req.query;
        const where = {};

        if (estado) where.estado = estado;
        if (tipo) where.tipo = tipo;

        const consultas = await Consulta.findAll({
            where,
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['id', 'username', 'email', 'rol']
            }],
            order: [['fechaCreacion', 'DESC']]
        });

        res.json(consultas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener consulta por ID
export const obtenerConsulta = async (req, res) => {
    try {
        const consulta = await Consulta.findByPk(req.params.id, {
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['id', 'username', 'email', 'rol']
            }]
        });

        if (!consulta) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }

        res.json(consulta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar consulta (responder o cambiar estado)
export const actualizarConsulta = async (req, res) => {
    try {
        const consulta = await Consulta.findByPk(req.params.id);

        if (!consulta) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }

        const { respuesta, estado } = req.body;

        if (respuesta) {
            consulta.respuesta = respuesta;
            consulta.fechaRespuesta = new Date();
            consulta.estado = 'resuelto';
        }

        if (estado) {
            consulta.estado = estado;
        }

        await consulta.save();

        res.json({
            mensaje: 'Consulta actualizada exitosamente',
            consulta
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar consulta
export const eliminarConsulta = async (req, res) => {
    try {
        const consulta = await Consulta.findByPk(req.params.id);

        if (!consulta) {
            return res.status(404).json({ error: 'Consulta no encontrada' });
        }

        await consulta.destroy();

        res.json({ mensaje: 'Consulta eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
