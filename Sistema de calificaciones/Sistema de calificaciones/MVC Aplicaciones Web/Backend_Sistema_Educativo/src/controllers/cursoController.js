import { Curso } from "../models/curso.js";
import { Estudiante } from "../models/estudiante.js";
import { Op } from "sequelize";

// ============================================
// LISTAR TODOS LOS CURSOS
// ============================================
export const listarCursos = async (req, res) => {
    try {
        const { estado, nivel, anio } = req.query;
        
        // Filtros opcionales
        const filtros = {};
        if (estado) filtros.estado = estado;
        if (nivel) filtros.nivel = { [Op.like]: `%${nivel}%` };
        if (anio) filtros.anio = anio;
        
        const cursos = await Curso.findAll({
            where: filtros,
            order: [['nivel', 'ASC'], ['paralelo', 'ASC']],
            include: [{
                model: Estudiante,
                attributes: ['id', 'nombre', 'cedula'],
                where: { estado: 'activo' },
                required: false // LEFT JOIN para mostrar cursos sin estudiantes
            }]
        });
        
        // Agregar contador de estudiantes
        const cursosConContador = cursos.map(curso => ({
            ...curso.toJSON(),
            totalEstudiantes: curso.Estudiantes?.length || 0,
            disponibilidad: (curso.capacidad || 30) - (curso.Estudiantes?.length || 0)
        }));
        
        res.json(cursosConContador);
    } catch (error) {
        console.error("Error al listar cursos:", error);
        res.status(500).json({ error: "Error al obtener los cursos" });
    }
};

// ============================================
// OBTENER CURSO POR ID
// ============================================
export const obtenerCursoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const curso = await Curso.findByPk(id, {
            include: [{
                model: Estudiante,
                attributes: ['id', 'nombre', 'cedula', 'email', 'telefono'],
                where: { estado: 'activo' },
                required: false
            }]
        });
        
        if (!curso) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }
        
        const cursoConInfo = {
            ...curso.toJSON(),
            totalEstudiantes: curso.Estudiantes?.length || 0,
            disponibilidad: (curso.capacidad || 30) - (curso.Estudiantes?.length || 0)
        };
        
        res.json(cursoConInfo);
    } catch (error) {
        console.error("Error al obtener curso:", error);
        res.status(500).json({ error: "Error al obtener el curso" });
    }
};

// ============================================
// BUSCAR CURSO POR NOMBRE O NIVEL
// ============================================
export const buscarCurso = async (req, res) => {
    try {
        const { busqueda } = req.query;
        
        if (!busqueda) {
            return res.status(400).json({ error: "Debe proporcionar un término de búsqueda" });
        }
        
        const cursos = await Curso.findAll({
            where: {
                [Op.or]: [
                    { nombre: { [Op.like]: `%${busqueda}%` } },
                    { nivel: { [Op.like]: `%${busqueda}%` } },
                    { paralelo: { [Op.like]: `%${busqueda}%` } }
                ],
                estado: 'activo'
            },
            include: [{
                model: Estudiante,
                attributes: ['id'],
                where: { estado: 'activo' },
                required: false
            }]
        });
        
        if (cursos.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron cursos con ese criterio" });
        }
        
        const cursosConInfo = cursos.map(curso => ({
            ...curso.toJSON(),
            totalEstudiantes: curso.Estudiantes?.length || 0
        }));
        
        res.json(cursosConInfo);
    } catch (error) {
        console.error("Error al buscar cursos:", error);
        res.status(500).json({ error: "Error al buscar cursos" });
    }
};

// ============================================
// CREAR CURSO
// ============================================
export const crearCurso = async (req, res) => {
    try {
        const { nombre, nivel, paralelo, anio, capacidad, descripcion, estado } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: "El nombre del curso es obligatorio" });
        }
        
        // Verificar si ya existe un curso con ese nombre
        const cursoExistente = await Curso.findOne({ where: { nombre } });
        if (cursoExistente) {
            return res.status(400).json({ error: "Ya existe un curso con ese nombre" });
        }
        
        const nuevoCurso = await Curso.create({
            nombre,
            nivel,
            paralelo,
            anio,
            capacidad,
            descripcion,
            estado: estado || 'activo'
        });
        
        res.status(201).json(nuevoCurso);
    } catch (error) {
        console.error("Error al crear curso:", error);
        res.status(500).json({ error: "Error al crear el curso: " + error.message });
    }
};

// ============================================
// ACTUALIZAR CURSO
// ============================================
export const actualizarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const curso = await Curso.findByPk(id);
        
        if (!curso) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }
        
        const { nombre, nivel, paralelo, anio, capacidad, descripcion, estado } = req.body;
        
        // Verificar si el nuevo nombre ya existe en otro curso
        if (nombre && nombre !== curso.nombre) {
            const cursoConMismoNombre = await Curso.findOne({ 
                where: { 
                    nombre,
                    id: { [Op.ne]: id } 
                } 
            });
            
            if (cursoConMismoNombre) {
                return res.status(400).json({ error: "Ya existe otro curso con ese nombre" });
            }
        }
        
        await curso.update({
            nombre: nombre || curso.nombre,
            nivel: nivel !== undefined ? nivel : curso.nivel,
            paralelo: paralelo !== undefined ? paralelo : curso.paralelo,
            anio: anio !== undefined ? anio : curso.anio,
            capacidad: capacidad !== undefined ? capacidad : curso.capacidad,
            descripcion: descripcion !== undefined ? descripcion : curso.descripcion,
            estado: estado !== undefined ? estado : curso.estado
        });
        
        res.json(curso);
    } catch (error) {
        console.error("Error al actualizar curso:", error);
        res.status(500).json({ error: "Error al actualizar el curso: " + error.message });
    }
};

// ============================================
// ELIMINAR CURSO (LÓGICA)
// ============================================
export const eliminarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const curso = await Curso.findByPk(id);
        
        if (!curso) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }
        
        // Verificar si tiene estudiantes activos
        const estudiantesActivos = await Estudiante.count({
            where: { 
                cursoId: id,
                estado: 'activo'
            }
        });
        
        if (estudiantesActivos > 0) {
            return res.status(400).json({ 
                error: `No se puede eliminar el curso porque tiene ${estudiantesActivos} estudiante(s) activo(s).`,
                sugerencia: "Desactiva el curso en lugar de eliminarlo o reasigna los estudiantes."
            });
        }
        
        // Eliminación lógica: cambiar estado a inactivo
        await curso.update({ estado: 'inactivo' });
        
        res.json({ 
            mensaje: "Curso desactivado correctamente",
            curso 
        });
    } catch (error) {
        console.error("Error al eliminar curso:", error);
        res.status(500).json({ error: "Error al eliminar el curso" });
    }
};

// ============================================
// OBTENER ESTUDIANTES DE UN CURSO
// ============================================
export const obtenerEstudiantesCurso = async (req, res) => {
    try {
        const { id } = req.params;
        
        const curso = await Curso.findByPk(id, {
            include: [{
                model: Estudiante,
                where: { estado: 'activo' },
                required: false
            }]
        });
        
        if (!curso) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }
        
        res.json({
            curso: {
                id: curso.id,
                nombre: curso.nombre,
                nivel: curso.nivel,
                paralelo: curso.paralelo,
                capacidad: curso.capacidad
            },
            totalEstudiantes: curso.Estudiantes?.length || 0,
            estudiantes: curso.Estudiantes || []
        });
    } catch (error) {
        console.error("Error al obtener estudiantes del curso:", error);
        res.status(500).json({ error: "Error al obtener estudiantes del curso" });
    }
};

// ============================================
// ASIGNAR ESTUDIANTE A CURSO
// ============================================
export const asignarEstudianteCurso = async (req, res) => {
    try {
        const { cursoId, estudianteId } = req.body;
        
        if (!cursoId || !estudianteId) {
            return res.status(400).json({ error: "cursoId y estudianteId son obligatorios" });
        }
        
        // Verificar que el curso existe
        const curso = await Curso.findByPk(cursoId);
        if (!curso) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }
        
        // Verificar que el estudiante existe
        const estudiante = await Estudiante.findByPk(estudianteId);
        if (!estudiante) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        // Verificar capacidad del curso
        const estudiantesEnCurso = await Estudiante.count({
            where: { 
                cursoId,
                estado: 'activo'
            }
        });
        
        if (estudiantesEnCurso >= (curso.capacidad || 30)) {
            return res.status(400).json({ 
                error: "El curso ha alcanzado su capacidad máxima",
                capacidad: curso.capacidad,
                actual: estudiantesEnCurso
            });
        }
        
        // Asignar estudiante al curso
        await estudiante.update({ cursoId });
        
        res.json({ 
            mensaje: "Estudiante asignado al curso correctamente",
            estudiante: {
                id: estudiante.id,
                nombre: estudiante.nombre,
                cursoId: estudiante.cursoId
            }
        });
    } catch (error) {
        console.error("Error al asignar estudiante:", error);
        res.status(500).json({ error: "Error al asignar estudiante al curso" });
    }
};