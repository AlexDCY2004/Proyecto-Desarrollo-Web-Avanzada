import { Router } from 'express';
import { 
    crearConductor, 
    listarConductores, 
    buscarConductorId, 
    actualizarConductor, 
    eliminarConductor 
} from '../controllers/conductorController.js';

const router = Router();

// Rutas para conductores
router.post('/', crearConductor);
router.get('/', listarConductores);
router.get('/:id', buscarConductorId);
router.put('/:id', actualizarConductor);
router.delete('/:id', eliminarConductor);

export default router;
