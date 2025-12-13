import { Router } from 'express';
import { 
    crearUsuario, 
    listarUsuarios, 
    buscarUsuarioId, 
    actualizarUsuario, 
    eliminarUsuario,
    login
} from '../controllers/usuarioController.js';

const router = Router();

// Rutas para usuarios
router.post('/', crearUsuario);
router.get('/', listarUsuarios);
router.get('/:id', buscarUsuarioId);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

// Ruta de login
router.post('/login', login);

export default router;
