

import { Nota } from "../models/nota.js";
import { Estudiante } from "../models/estudiante.js";
import { Asignatura } from "../models/asignatura.js";
import { Docente } from "../models/docente.js";
import { Op } from "sequelize";

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Validar que un número esté entre 0 y 20
const enRango = (n) => {
    return typeof n === "number" && !isNaN(n) && n >= 0 && n <= 20;
};

// Calcular nota final de un parcial
const calcularNotaFinalParcial = (tarea, informe, leccion, examen) => {
    return parseFloat((
        parseFloat(tarea) * 0.20 +
        parseFloat(informe) * 0.20 +
        parseFloat(leccion) * 0.20 +
        parseFloat(examen) * 0.40
    ).toFixed(2));
};

// ============================================
// CRUD BÁSICO DE NOTAS
// ============================================

// Listar todas las notas con filtros opcionales
export const listarNotas = async (req, res) => {
    try {
        const { estudianteId, docenteId, asignaturaId, parcial, estado, ordenar } = req.query;
        
        // Construir filtros dinámicos
        const filtros = {};
        if (estudianteId) filtros.estudianteId = estudianteId;
        if (docenteId) filtros.docenteId = docenteId;
        if (asignaturaId) filtros.asignaturaId = asignaturaId;
        if (parcial) filtros.parcial = parcial;
        if (estado) filtros.estado = estado;
        
        // Configurar ordenamiento
        let orden = [['fecha', 'DESC']]; // Por defecto: más recientes primero
        if (ordenar === 'mayor') orden = [['notaFinal', 'DESC']];
        if (ordenar === 'menor') orden = [['notaFinal', 'ASC']];
        
        const notas = await Nota.findAll({
            where: filtros,
            include: [
                { 
                    model: Estudiante, 
                    attributes: ['id', 'nombre', 'cedula'],
                    required: false
                },
                { 
                    model: Asignatura, 
                    attributes: ['id', 'nombre', 'codigo'],
                    required: false
                },
                { 
                    model: Docente, 
                    attributes: ['id', 'nombre'],
                    required: false
                }
            ],
            order: orden
        });
        
        return res.json(notas);
    } catch (error) {
        console.error("Error al listar notas:", error);
        return res.status(500).json({ error: "Error al obtener notas" });
    }
};

// Obtener una nota por ID
export const obtenerNotaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await Nota.findByPk(id, {
            include: [
                { model: Estudiante, required: false },
                { model: Asignatura, required: false },
                { model: Docente, required: false }
            ]
        });
        
        if (!nota) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }
        
        return res.json(nota);
    } catch (error) {
        console.error("Error al obtener nota:", error);
        return res.status(500).json({ error: "Error al obtener la nota" });
    }
};

// Crear una nueva nota
export const crearNota = async (req, res) => {
    try {
        const { 
            estudianteId, 
            asignaturaId, 
            docenteId, 
            parcial, 
            tarea, 
            informe, 
            leccion, 
            examen,
            observaciones 
        } = req.body;
        
        // Validaciones básicas
        if (!estudianteId || !asignaturaId || !parcial || 
            tarea == null || informe == null || leccion == null || examen == null) {
            return res.status(400).json({ 
                error: "Faltan campos obligatorios: estudianteId, asignaturaId, parcial, tarea, informe, leccion, examen" 
            });
        }
        
        // Verificar que el estudiante existe
        const estudiante = await Estudiante.findByPk(estudianteId);
        if (!estudiante) {
            return res.status(400).json({ error: "El estudiante no existe" });
        }
        
        // Verificar que la asignatura existe
        const asignatura = await Asignatura.findByPk(asignaturaId);
        if (!asignatura) {
            return res.status(400).json({ error: "La asignatura no existe" });
        }
        
        // Validar parcial
        if (![1, 2, 3].includes(parseInt(parcial))) {
            return res.status(400).json({ error: "El parcial debe ser 1, 2 o 3" });
        }
        
        // Validar que las notas estén en rango 0-20
        const notas = [tarea, informe, leccion, examen].map(n => parseFloat(n));
        if (!notas.every(enRango)) {
            return res.status(400).json({ 
                error: "Todas las notas deben estar entre 0 y 20" 
            });
        }
        
        // Verificar si ya existe una nota para este estudiante, asignatura y parcial
        const notaExistente = await Nota.findOne({
            where: { estudianteId, asignaturaId, parcial }
        });
        
        if (notaExistente) {
            return res.status(400).json({ 
                error: `Ya existe una nota registrada para el parcial ${parcial} de esta asignatura` 
            });
        }
        
        // Crear la nota (el hook calculará notaFinal y estado automáticamente)
        const nuevaNota = await Nota.create({
            estudianteId,
            asignaturaId,
            docenteId,
            parcial: parseInt(parcial),
            tarea: parseFloat(tarea),
            informe: parseFloat(informe),
            leccion: parseFloat(leccion),
            examen: parseFloat(examen),
            observaciones
        });
        
        // Obtener la nota completa con relaciones
        const notaCompleta = await Nota.findByPk(nuevaNota.id, {
            include: [
                { model: Estudiante, attributes: ['id', 'nombre', 'cedula'] },
                { model: Asignatura, attributes: ['id', 'nombre'] }
            ]
        });
        
        return res.status(201).json(notaCompleta);
    } catch (error) {
        console.error("Error al crear nota:", error);
        return res.status(500).json({ error: "Error al crear la nota: " + error.message });
    }
};

// Actualizar una nota
export const actualizarNota = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await Nota.findByPk(id);
        
        if (!nota) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }
        
        const { tarea, informe, leccion, examen, observaciones, docenteId } = req.body;
        
        // Preparar datos para actualizar
        const datosActualizar = {};
        
        if (tarea !== undefined) {
            if (!enRango(parseFloat(tarea))) {
                return res.status(400).json({ error: "La tarea debe estar entre 0 y 20" });
            }
            datosActualizar.tarea = parseFloat(tarea);
        }
        
        if (informe !== undefined) {
            if (!enRango(parseFloat(informe))) {
                return res.status(400).json({ error: "El informe debe estar entre 0 y 20" });
            }
            datosActualizar.informe = parseFloat(informe);
        }
        
        if (leccion !== undefined) {
            if (!enRango(parseFloat(leccion))) {
                return res.status(400).json({ error: "La lección debe estar entre 0 y 20" });
            }
            datosActualizar.leccion = parseFloat(leccion);
        }
        
        if (examen !== undefined) {
            if (!enRango(parseFloat(examen))) {
                return res.status(400).json({ error: "El examen debe estar entre 0 y 20" });
            }
            datosActualizar.examen = parseFloat(examen);
        }
        
        if (observaciones !== undefined) {
            datosActualizar.observaciones = observaciones;
        }
        
        if (docenteId !== undefined) {
            datosActualizar.docenteId = docenteId;
        }
        
        // Actualizar (el hook recalculará notaFinal y estado si cambió alguna nota)
        await nota.update(datosActualizar);
        
        // Obtener nota actualizada con relaciones
        const notaActualizada = await Nota.findByPk(id, {
            include: [
                { model: Estudiante, attributes: ['id', 'nombre', 'cedula'] },
                { model: Asignatura, attributes: ['id', 'nombre'] }
            ]
        });
        
        return res.json(notaActualizada);
    } catch (error) {
        console.error("Error al actualizar nota:", error);
        return res.status(500).json({ error: "Error al actualizar la nota: " + error.message });
    }
};

// Eliminar una nota (eliminación física - puedes cambiar a lógica si prefieres)
export const eliminarNota = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await Nota.findByPk(id);
        
        if (!nota) {
            return res.status(404).json({ error: "Nota no encontrada" });
        }
        
        await nota.destroy();
        
        return res.json({ 
            ok: true, 
            mensaje: "Nota eliminada correctamente" 
        });
    } catch (error) {
        console.error("Error al eliminar nota:", error);
        return res.status(500).json({ error: "Error al eliminar la nota" });
    }
};

// ============================================
// ENDPOINTS ESPECIALES PARA ESTADO ACADÉMICO
// ============================================

// Obtener todas las notas de un estudiante agrupadas por asignatura
export const obtenerNotasEstudiante = async (req, res) => {
    try {
        const { estudianteId } = req.params;
        
        // Verificar que el estudiante existe
        const estudiante = await Estudiante.findByPk(estudianteId);
        if (!estudiante) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        // Obtener todas las notas del estudiante
        const notas = await Nota.findAll({
            where: { estudianteId },
            include: [
                { model: Asignatura, attributes: ['id', 'nombre'] }
            ],
            order: [['asignaturaId', 'ASC'], ['parcial', 'ASC']]
        });
        
        // Agrupar por asignatura
        const notasPorAsignatura = {};
        
        notas.forEach(nota => {
            const asignaturaId = nota.asignaturaId;
            const asignaturaNombre = nota.Asignatura?.nombre || 'Sin asignatura';
            
            if (!notasPorAsignatura[asignaturaId]) {
                notasPorAsignatura[asignaturaId] = {
                    asignaturaId,
                    asignaturaNombre,
                    parciales: {}
                };
            }
            
            notasPorAsignatura[asignaturaId].parciales[nota.parcial] = {
                id: nota.id,
                parcial: nota.parcial,
                tarea: nota.tarea,
                informe: nota.informe,
                leccion: nota.leccion,
                examen: nota.examen,
                notaFinal: nota.notaFinal,
                estado: nota.estado,
                fecha: nota.fecha,
                observaciones: nota.observaciones
            };
        });
        
        return res.json({
            estudiante: {
                id: estudiante.id,
                nombre: estudiante.nombre,
                cedula: estudiante.cedula,
                curso: estudiante.curso
            },
            asignaturas: Object.values(notasPorAsignatura)
        });
    } catch (error) {
        console.error("Error al obtener notas del estudiante:", error);
        return res.status(500).json({ error: "Error al obtener las notas del estudiante" });
    }
};

// Obtener estado académico completo de un estudiante por asignatura
export const obtenerEstadoAcademico = async (req, res) => {
    try {
        const { estudianteId, asignaturaId } = req.params;
        
        // Verificar que el estudiante existe
        const estudiante = await Estudiante.findByPk(estudianteId);
        if (!estudiante) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        // Verificar que la asignatura existe
        const asignatura = await Asignatura.findByPk(asignaturaId);
        if (!asignatura) {
            return res.status(404).json({ error: "Asignatura no encontrada" });
        }
        
        // Obtener las notas de los 3 parciales
        const notas = await Nota.findAll({
            where: { 
                estudianteId, 
                asignaturaId 
            },
            order: [['parcial', 'ASC']]
        });
        
        // Organizar notas por parcial
        const parciales = {
            1: null,
            2: null,
            3: null
        };
        
        notas.forEach(nota => {
            parciales[nota.parcial] = {
                tarea: nota.tarea,
                informe: nota.informe,
                leccion: nota.leccion,
                examen: nota.examen,
                notaFinal: nota.notaFinal,
                estado: nota.estado
            };
        });
        
        // Calcular totales y estado
        const notaParcial1 = parciales[1]?.notaFinal || 0;
        const notaParcial2 = parciales[2]?.notaFinal || 0;
        const notaParcial3 = parciales[3]?.notaFinal || 0;
        
        const sumaParcial1y2 = notaParcial1 + notaParcial2;
        const promedioSemestre = notaParcial1 + notaParcial2 + notaParcial3;
        
        // Determinar estado académico
        let estadoSemestre = 'pendiente';
        let mensajeEstado = '';
        
        // Verificar reprobación anticipada (P1 + P2 < 28)
        if (parciales[1] && parciales[2]) {
            if (sumaParcial1y2 < 28) {
                estadoSemestre = 'reprobado_anticipado';
                mensajeEstado = 'Reprobado anticipadamente. La suma del Parcial 1 y Parcial 2 es menor a 28 puntos.';
            } else if (parciales[3]) {
                // Si tiene los 3 parciales, evaluar el semestre completo
                if (promedioSemestre >= 28) { // Ajusta este valor según tu sistema
                    estadoSemestre = 'aprobado';
                    mensajeEstado = 'Aprobó el semestre';
                } else {
                    estadoSemestre = 'reprobado';
                    mensajeEstado = 'Reprobó el semestre';
                }
            }
        }
        
        return res.json({
            estudiante: {
                id: estudiante.id,
                nombre: estudiante.nombre,
                cedula: estudiante.cedula
            },
            asignatura: {
                id: asignatura.id,
                nombre: asignatura.nombre
            },
            parciales,
            resumen: {
                notaParcial1,
                notaParcial2,
                notaParcial3,
                sumaParcial1y2,
                promedioSemestre,
                estadoSemestre,
                mensajeEstado
            }
        });
    } catch (error) {
        console.error("Error al obtener estado académico:", error);
        return res.status(500).json({ error: "Error al obtener el estado académico" });
    }
};
