import { Compra, CompraItem } from "../models/compraArboles.js";
import { Arbol } from "../models/arbol.js";
import { sequelize } from "../config/database.js";

const IVA = 0.19;
const DESCUENTO_ADICIONAL_PORC = 15.0;

// Helper: calcula líneas y totales a partir de items [{ arbolId, cantidad }]
async function calcularTotalesDesdeItems(items) {
	if (!Array.isArray(items) || items.length === 0) throw new Error('La lista de items está vacía');

	let subtotal = 0;
	let totalCantidad = 0;
	const lineas = [];

	for (const it of items) {
		if (!it || typeof it.arbolId !== 'number' || !Number.isInteger(it.cantidad) || it.cantidad < 0) {
			throw new Error('Ítem inválido. Debe incluir arbolId (número) y cantidad (entero >=0).');
		}
		const arbol = await Arbol.findByPk(it.arbolId);
		if (!arbol) throw new Error(`Árbol no encontrado: id ${it.arbolId}`);

		const precio = parseFloat(arbol.precioUnitario);
		const rebaja100_300 = parseFloat(arbol.rebaja100_300);
		const rebajaMas300 = parseFloat(arbol.rebajaMas300);

		let descuento = 0;
		if (it.cantidad > 300) descuento = rebajaMas300;
		else if (it.cantidad > 100) descuento = rebaja100_300;

		const precioConDesc = precio * (1 - descuento / 100);
		const subtotalLinea = Number((precioConDesc * it.cantidad).toFixed(2));

		lineas.push({
			arbolId: it.arbolId,
			cantidad: it.cantidad,
			precioUnitario: precio,
			descuentoPercent: descuento,
			subtotalLinea
		});

		subtotal += subtotalLinea;
		totalCantidad += it.cantidad;
	}

	let subtotalConDescuento = subtotal;
	if (totalCantidad > 1000) subtotalConDescuento = Number((subtotal * (1 - DESCUENTO_ADICIONAL_PORC / 100)).toFixed(2));

	const iva = Number((subtotalConDescuento * IVA).toFixed(2));
	const total = Number((subtotalConDescuento + iva).toFixed(2));

	return {
		lineas,
		subtotal: Number(subtotal.toFixed(2)),
		subtotalConDescuento,
		iva,
		total,
		totalCantidad
	};
}

// Crear una compra: body { compradorNombre: string, items: [{ arbolId, cantidad }, ...] }
export async function crearCompra(req, res) {
	try {
		const { compradorNombre, items } = req.body;
		if (!compradorNombre || typeof compradorNombre !== 'string' || compradorNombre.trim() === '') {
			return res.status(400).json({ error: 'El nombre del comprador es obligatorio' });
		}
		const calculo = await calcularTotalesDesdeItems(items);

		const t = await sequelize.transaction();
		try {
			const compra = await Compra.create({
				compradorNombre: compradorNombre.trim(), // <-- guardar nombre
				subtotal: calculo.subtotal,
				subtotalConDescuento: calculo.subtotalConDescuento,
				iva: calculo.iva,
				total: calculo.total,
				totalCantidad: calculo.totalCantidad
			}, { transaction: t });

			for (const linea of calculo.lineas) {
				await CompraItem.create({
					compraId: compra.id,
					arbolId: linea.arbolId,
					cantidad: linea.cantidad
				}, { transaction: t });
			}

			await t.commit();

			const compraGuardada = await Compra.findByPk(compra.id, {
				include: [{ model: CompraItem, as: 'items', include: [{ model: Arbol, as: 'arbol' }] }]
			});
			return res.status(201).json({ message: 'Compra creada correctamente', compra: compraGuardada });
		} catch (err) {
			await t.rollback();
			throw err;
		}
	} catch (err) {
		return res.status(400).json({ error: 'Error al crear compra', details: err.message });
	}
}

export async function listarCompras(req, res) {
	try {
		const compras = await Compra.findAll({
			include: [{ model: CompraItem, as: 'items', include: [{ model: Arbol, as: 'arbol' }] }],
			order: [['id','DESC']]
		});
		return res.json(compras);
	} catch (err) {
		return res.status(500).json({ error: 'Error al listar compras', details: err.message });
	}
}

export async function obtenerCompraPorId(req, res) {
	try {
		const { id } = req.params;
		const compra = await Compra.findByPk(id, {
			include: [{ model: CompraItem, as: 'items', include: [{ model: Arbol, as: 'arbol' }] }]
		});
		if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
		return res.json(compra);
	} catch (err) {
		return res.status(500).json({ error: 'Error al obtener compra', details: err.message });
	}
}

// Endpoint: calcular precio por árbol (sin persistir). body: { arbolId, cantidad }
export async function calcularPrecioArbol(req, res) {
	try {
		const { arbolId, cantidad } = req.body;
		const resultado = await calcularTotalesDesdeItems([{ arbolId, cantidad }]);
		// devolver la primera línea y totales
		const linea = resultado.lineas[0];
		return res.json({
			arbolId: linea.arbolId,
			cantidad: linea.cantidad,
			precioUnitario: linea.precioUnitario,
			descuentoPercent: linea.descuentoPercent,
			subtotalLinea: linea.subtotalLinea
		});
	} catch (err) {
		return res.status(400).json({ error: 'Error al calcular precio por árbol', details: err.message });
	}
}

// Endpoint: calcular total de una orden (sin persistir). body: { items: [{ arbolId, cantidad }, ...] }
export async function calcularTotalOrden(req, res) {
	try {
		const { items } = req.body;
		const resultado = await calcularTotalesDesdeItems(items);
		return res.json({
			subtotalSinAdicional: resultado.subtotal,
			subtotalConAdicional: resultado.subtotalConDescuento,
			iva: resultado.iva,
			total: resultado.total,
			totalCantidad: resultado.totalCantidad,
			lineas: resultado.lineas
		});
	} catch (err) {
		return res.status(400).json({ error: 'Error al calcular total de la orden', details: err.message });
	}
}

// Actualizar una compra: reemplaza las líneas (items) y recalcula totales
export async function actualizarCompra(req, res) {
	try {
		const { id } = req.params;
		const { items, compradorNombre } = req.body;
		if (!Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ error: 'La actualización debe incluir items (array no vacío)' });
		}

		// Verificar que la compra exista
		const compraExistente = await Compra.findByPk(id);
		if (!compraExistente) return res.status(404).json({ error: 'Compra no encontrada' });

		// Calcular totales (puede lanzar errores de validación)
		let calculo;
		try {
			calculo = await calcularTotalesDesdeItems(items);
		} catch (err) {
			return res.status(400).json({ error: 'Error en items', details: err.message });
		}

		const t = await sequelize.transaction();
		try {
			// actualizar campos de compra (incluye compradorNombre si se proporciona)
			await compraExistente.update({
				compradorNombre: compradorNombre && typeof compradorNombre === 'string' && compradorNombre.trim() !== '' ? compradorNombre.trim() : compraExistente.compradorNombre,
				subtotal: calculo.subtotal,
				subtotalConDescuento: calculo.subtotalConDescuento,
				iva: calculo.iva,
				total: calculo.total,
				totalCantidad: calculo.totalCantidad
			}, { transaction: t });

			// eliminar líneas anteriores y crear las nuevas
			await CompraItem.destroy({ where: { compraId: compraExistente.id }, transaction: t });

			const nuevasLineas = calculo.lineas.map(l => ({
				compraId: compraExistente.id,
				arbolId: l.arbolId,
				cantidad: l.cantidad
			}));
			if (nuevasLineas.length) await CompraItem.bulkCreate(nuevasLineas, { transaction: t });

			await t.commit();

			const compraActualizada = await Compra.findByPk(compraExistente.id, {
				include: [{ model: CompraItem, as: 'items', include: [{ model: Arbol, as: 'arbol' }] }]
			});
			return res.json({ message: 'Compra actualizada correctamente', compra: compraActualizada });
		} catch (err) {
			await t.rollback();
			throw err;
		}
	} catch (err) {
		return res.status(500).json({ error: 'Error al actualizar compra', details: err.message });
	}
}

// Eliminar una compra y sus líneas
export async function eliminarCompra(req, res) {
	try {
		const { id } = req.params;
		const compra = await Compra.findByPk(id);
		if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });

		const t = await sequelize.transaction();
		try {
			await CompraItem.destroy({ where: { compraId: compra.id }, transaction: t });
			await compra.destroy({ transaction: t });
			await t.commit();
		
			return res.status(200).json({ message: 'Compra eliminada correctamente' });
		} catch (err) {
			await t.rollback();
			throw err;
		}
	} catch (err) {
		return res.status(500).json({ error: 'Error al eliminar compra', details: err.message });
	}
}
