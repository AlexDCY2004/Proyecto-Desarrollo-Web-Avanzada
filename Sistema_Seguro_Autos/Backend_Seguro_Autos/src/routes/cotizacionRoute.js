import { Router } from 'express';
import { 
    crearCotizacion, 
    listarCotizaciones, 
    buscarCotizacionId, 
    actualizarCotizacion, 
    eliminarCotizacion 
} from '../controllers/cotizacionController.js';

const router = Router();

// Rutas para cotizaciones
router.post('/', crearCotizacion);
router.get('/', listarCotizaciones);
router.get('/:id', buscarCotizacionId);
router.put('/:id', actualizarCotizacion);
router.delete('/:id', eliminarCotizacion);

export default router;
