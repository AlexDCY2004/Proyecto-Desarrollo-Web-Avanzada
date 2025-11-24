import express from 'express';
import ClienteController from '../controllers/cliente.controller.js';

const router = express.Router();

// Nuevo: obtener resultados guardados
router.get('/', ClienteController.listar);

// Endpoint: POST /api/clientes/calcular
router.post('/crear', ClienteController.crearCliente);
router.post('/calcular', ClienteController.calcular);

export default router;
