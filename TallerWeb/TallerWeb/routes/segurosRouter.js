import { Router } from 'express';
import segurosController from '../controllers/segurosController.js';

const router = Router();

// Rutas CRUD
router.get('/', segurosController.list);
router.get('/:id', segurosController.getById);
router.post('/', segurosController.create);
router.put('/:id', segurosController.update);
router.delete('/:id', segurosController.remove);

export default router;
