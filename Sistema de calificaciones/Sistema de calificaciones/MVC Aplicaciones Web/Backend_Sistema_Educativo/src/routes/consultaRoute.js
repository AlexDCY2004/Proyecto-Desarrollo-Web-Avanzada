import express from 'express';
import {
    crearConsulta,
    listarConsultas,
    obtenerConsulta,
    actualizarConsulta,
    eliminarConsulta
} from '../controllers/consultaController.js';

const router = express.Router();

router.post('/', crearConsulta);
router.get('/', listarConsultas);
router.get('/:id', obtenerConsulta);
router.put('/:id', actualizarConsulta);
router.delete('/:id', eliminarConsulta);

export default router;
