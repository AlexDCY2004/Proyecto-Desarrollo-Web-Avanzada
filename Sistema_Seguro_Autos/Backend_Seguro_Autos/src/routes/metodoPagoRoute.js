import { Router } from 'express';
import { 
    crearMetodoPago, 
    listarMetodosPago, 
    buscarMetodoPagoId, 
    actualizarMetodoPago, 
    eliminarMetodoPago 
} from '../controllers/metodoPagoController.js';

const router = Router();

// Rutas para métodos de pago
router.post('/', crearMetodoPago);
router.get('/', listarMetodosPago);
router.get('/:id', buscarMetodoPagoId);
router.put('/:id', actualizarMetodoPago);
router.delete('/:id', eliminarMetodoPago);

export default router;
