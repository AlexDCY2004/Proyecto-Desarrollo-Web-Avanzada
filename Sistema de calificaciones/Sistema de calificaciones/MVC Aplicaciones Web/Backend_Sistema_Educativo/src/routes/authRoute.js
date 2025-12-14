import express from 'express';
import { loginController, registroController, obtenerPerfilController } from '../controllers/authController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/login', loginController);
router.post('/registro', registroController);

// Rutas protegidas
router.get('/perfil', verificarToken, obtenerPerfilController);

export default router;
