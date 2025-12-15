import { Router } from 'express';
import {
    crearPoliza,
    listarPolizas,
    buscarPolizaId,
    actualizarEstadoPoliza
} from '../controllers/polizaController.js';

const router = Router();

// Rutas para Pólizas
router.post('/', crearPoliza);
router.get('/', listarPolizas);
router.get('/:id', buscarPolizaId);
router.patch('/:id/estado', actualizarEstadoPoliza); // PATCH para actualizar solo estado

export default router;
