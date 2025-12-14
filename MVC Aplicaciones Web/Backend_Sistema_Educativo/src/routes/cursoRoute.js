import { Router } from 'express';
import {
    listarCursos,
    obtenerCursoPorId,
    buscarCurso,
    crearCurso,
    actualizarCurso,
    eliminarCurso,
    obtenerEstudiantesCurso,
    asignarEstudianteCurso
} from '../controllers/cursoController.js';

const router = Router();

// CRUD básico
router.post('/', crearCurso);
router.get('/', listarCursos); // Acepta query params: ?estado=activo&nivel=Primero&anio=2025
router.get('/buscar', buscarCurso); // ?busqueda=Primero
router.get('/:id', obtenerCursoPorId);
router.put('/:id', actualizarCurso);
router.delete('/:id', eliminarCurso); // Eliminación lógica

// Endpoints especiales
router.get('/:id/estudiantes', obtenerEstudiantesCurso);
router.post('/asignar-estudiante', asignarEstudianteCurso);

export default router;