import { Router } from 'express';
import {
    crearCotizacion,
    listarCotizaciones,
    buscarCotizacionId,
    actualizarCotizacion,
    eliminarCotizacion,
    cambiarEstadoCotizacion
} from '../controllers/cotizacionController.js';

const router = Router();

// Rutas para cotizaciones
router.post('/', crearCotizacion);
router.get('/', listarCotizaciones);
router.get('/:id', buscarCotizacionId);
router.put('/:id', actualizarCotizacion);
router.delete('/:id', eliminarCotizacion);
router.patch('/:id/estado', cambiarEstadoCotizacion);

export default router;
