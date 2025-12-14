import {Router} from 'express';
import { 
    crearAsignatura, 
    listarAsignaturas, 
    buscarAsignaturaId, 
    actualizarAsignatura, 
    eliminarAsignatura 
} from '../controllers/asignaturaController.js';

const router = Router();

//Rutas para asignaturas
router.post('/', crearAsignatura);
router.get('/', listarAsignaturas);
router.get('/:id', buscarAsignaturaId);
router.put('/:id', actualizarAsignatura);
router.delete('/:id', eliminarAsignatura);

export default router;