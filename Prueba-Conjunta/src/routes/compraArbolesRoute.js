import { Router } from "express";
import {
	crearCompra,
	listarCompras,
	obtenerCompraPorId,
	calcularPrecioArbol,
	calcularTotalOrden,
	actualizarCompra,
	eliminarCompra
} from "../controllers/compraArbolesController.js";

const router = Router();

router.post("/", crearCompra);
router.get("/", listarCompras);
router.get("/:id", obtenerCompraPorId);
router.put("/:id", actualizarCompra);
router.delete("/:id", eliminarCompra);

// Rutas de cálculo (no persisten)
router.post("/calcular-precio", calcularPrecioArbol); // body: { arbolId, cantidad }
router.post("/calcular-total", calcularTotalOrden);   // body: { items: [{ arbolId, cantidad }, ...] }

export default router;
