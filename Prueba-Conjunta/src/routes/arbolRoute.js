import { Router } from "express";
import {
	listarArboles,
	obtenerArbolPorId,
	crearArbol,
	actualizarArbol,
	eliminarArbol
} from "../controllers/arbolController.js";

const router = Router();

// Rutas CRUD (usar raíz porque el router se monta en /api/arboles)
router.get("/", listarArboles);
router.get("/:id", obtenerArbolPorId);
router.post("/", crearArbol);
router.put("/:id", actualizarArbol);
router.delete("/:id", eliminarArbol);

export default router;
