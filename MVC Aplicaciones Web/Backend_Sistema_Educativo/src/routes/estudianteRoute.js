import {Router} from 'express';
import { 
    crearEstudiante, 
    listarEstudiantes, 
    buscarEstudianteId, 
    actualizarEstudiante, 
    eliminarEstudiante,
    buscarEstudiante,
    buscarEstudiantePorCedula,
    buscarEstudiantePorNombre
} from '../controllers/estudianteController.js';

const router = Router();

//Rutas para estudiantes
router.post('/', crearEstudiante);
router.get('/', listarEstudiantes);
router.get('/buscar', buscarEstudiante);
router.get('/cedula/:cedula', buscarEstudiantePorCedula);
router.get('/nombre/:nombre', buscarEstudiantePorNombre);
router.get('/:id', buscarEstudianteId);
router.put('/:id', actualizarEstudiante);
router.delete('/:id', eliminarEstudiante);

export default router;
