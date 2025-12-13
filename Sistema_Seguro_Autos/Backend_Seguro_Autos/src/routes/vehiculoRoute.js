import { Router } from 'express';
import { 
    crearVehiculo, 
    listarVehiculos, 
    buscarVehiculoId, 
    actualizarVehiculo, 
    eliminarVehiculo 
} from '../controllers/vehiculoController.js';

const router = Router();

// Rutas para vehículos
router.post('/', crearVehiculo);
router.get('/', listarVehiculos);
router.get('/:id', buscarVehiculoId);
router.put('/:id', actualizarVehiculo);
router.delete('/:id', eliminarVehiculo);

export default router;
