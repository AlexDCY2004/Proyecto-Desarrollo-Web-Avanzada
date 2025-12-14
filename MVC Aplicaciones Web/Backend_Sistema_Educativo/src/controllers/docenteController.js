import { Docente } from "../models/docente.js";
import { Asignatura } from "../models/asignatura.js";

export const crearDocente = async (req, res) => {
    try {
        const { 
            nombre, 
            cedula, 
            email, 
            telefono, 
            direccion, 
            fechaContratacion, 
            especialidad, 
            horasLaborales, 
            departamento 
        } = req.body;
        
        if (!nombre || !cedula || !departamento) {
            return res.status(400).json({ error: "Faltan datos requeridos: nombre, cedula y departamento son obligatorios" });
        }
        
        const nuevo = await Docente.create({ 
            nombre, 
            cedula, 
            email, 
            telefono, 
            direccion, 
            fechaContratacion, 
            especialidad, 
            horasLaborales, 
            departamento 
        });
        
        return res.status(201).json(nuevo);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const listarDocentes = async (req, res) => {
    try {
        const docentes = await Docente.findAll();
        return res.json(docentes);
    } catch (err) {
        return res.status(500).json({ error: "Error al listar docentes" });
    }
};

export const obtenerDocentePorId = async (req, res) => {
    try {
        const { id } = req.params;
        const docente = await Docente.findByPk(id);
        if (!docente) return res.status(404).json({ error: "Docente no encontrado" });
        return res.json(docente);
    } catch (err) {
        return res.status(500).json({ error: "Error al obtener docente" });
    }
};

export const ActualizarDocente = async (req, res) => {
    try {
        const { id } = req.params;
        const docente = await Docente.findByPk(id);
        if (!docente) return res.status(404).json({ error: "Docente no encontrado" });

        const { 
            nombre, 
            cedula, 
            email, 
            telefono, 
            direccion, 
            fechaContratacion, 
            especialidad, 
            horasLaborales, 
            departamento 
        } = req.body;
        
        await docente.update({ 
            nombre: nombre ?? docente.nombre,
            cedula: cedula ?? docente.cedula,
            email: email ?? docente.email,
            telefono: telefono ?? docente.telefono,
            direccion: direccion ?? docente.direccion,
            fechaContratacion: fechaContratacion ?? docente.fechaContratacion,
            especialidad: especialidad ?? docente.especialidad,
            horasLaborales: horasLaborales ?? docente.horasLaborales,
            departamento: departamento ?? docente.departamento
        });

        return res.json(docente);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const eliminarDocente = async (req, res) => {
    try{
        const docente = await Docente.findByPk(req.params.id);
        if(!docente)
            return res.status(404).json({mensaje: "Docente no encontrado para eliminar"});

        await docente.destroy();
        res.json({mensaje: "Docente eliminado correctamente"});

    } catch (error){
        res.status(500).json({mensaje: "Error al eliminar el docente", error: error.mensaje});
    }
};

export const asignarAsignatura = async (req, res) => {
    try {
        const { id: docenteId, asignaturaId } = req.params;
        const docente = await Docente.findByPk(docenteId);
        if (!docente) return res.status(404).json({ error: "Docente no encontrado" });

        const asignatura = await Asignatura.findByPk(asignaturaId);
        if (!asignatura) return res.status(404).json({ error: "Asignatura no encontrada" });

        await asignatura.update({ docenteId: docente.id });
        return res.json(asignatura);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const desasignarAsignatura = async (req, res) => {
    try {
        const { id: docenteId, asignaturaId } = req.params;
        // opcional: verificar docente existe
        const asignatura = await Asignatura.findByPk(asignaturaId);
        if (!asignatura) return res.status(404).json({ error: "Asignatura no encontrada" });

        // permitir solo si la asignatura estaba asignada al docente indicado (seguridad opcional)
        if (asignatura.docenteId && String(asignatura.docenteId) !== String(docenteId)) {
            return res.status(400).json({ error: "La asignatura no está asignada a ese docente" });
        }

        await asignatura.update({ docenteId: null });
        return res.json(asignatura);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const listarAsignaturasDeDocente = async (req, res) => {
    try {
        const { id: docenteId } = req.params;
        const asignaturas = await Asignatura.findAll({ where: { docenteId } });
        return res.json(asignaturas);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

