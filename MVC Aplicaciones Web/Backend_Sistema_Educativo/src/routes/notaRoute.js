//rutas de notas
import {Router} from 'express';
import {
	crearNota,
	listarNotas,
	obtenerNotaPorId,
	actualizarNota,
	eliminarNota,
	obtenerNotasEstudiante,
    obtenerEstadoAcademico
} from "../controllers/notaController.js";

const router = Router();

//Rutas para estudiantes (más específicas primero)
router.post('/', crearNota);
router.get('/', listarNotas);
router.get('/estudiante/:estudianteId', obtenerNotasEstudiante);
router.get('/estudiante/:estudianteId/asignatura/:asignaturaId', obtenerEstadoAcademico);

// Rutas genéricas después para evitar que "/:id" intercepte las anteriores
router.get('/:id', obtenerNotaPorId);
router.put('/:id', actualizarNota);
router.delete('/:id', eliminarNota);


export default router;
