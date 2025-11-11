import { Arbol } from "../models/arbol.js";

// Listar todos los tipos de árboles
export async function listarArboles(req, res) {
	try {
		const arboles = await Arbol.findAll();
		return res.json(arboles);
	} catch (err) {
		return res.status(500).json({ error: 'Error al listar árboles', details: err.message });
	}
}

// Obtener un tipo por id
export async function obtenerArbolPorId(req, res) {
	try {
		const { id } = req.params;
		const arbol = await Arbol.findByPk(id);
		if (!arbol) return res.status(404).json({ error: 'Árbol no encontrado' });
		return res.json(arbol);
	} catch (err) {
		return res.status(500).json({ error: 'Error al obtener árbol', details: err.message });
	}
}

// Crear un nuevo tipo de árbol
export async function crearArbol(req, res) {
	try {
		const { tipo, precioUnitario, rebaja100_300, rebajaMas300 } = req.body;
		if (!tipo || precioUnitario == null || rebaja100_300 == null || rebajaMas300 == null) {
			return res.status(400).json({ error: 'Faltan campos obligatorios' });
		}
		const nuevo = await Arbol.create({ tipo, precioUnitario, rebaja100_300, rebajaMas300 });
		return res.status(201).json(nuevo);
	} catch (err) {
		return res.status(500).json({ error: 'Error al crear árbol', details: err.message });
	}
}

// Actualizar un tipo existente
export async function actualizarArbol(req, res) {
	try {
		const { id } = req.params;
		const cambios = req.body;
		const arbol = await Arbol.findByPk(id);
		if (!arbol) return res.status(404).json({ error: 'Árbol no encontrado' });
		await arbol.update(cambios);
		return res.json(arbol);
	} catch (err) {
		return res.status(500).json({ error: 'Error al actualizar árbol', details: err.message });
	}
}

// Eliminar un tipo
export async function eliminarArbol(req, res) {
	try {
		const { id } = req.params;
		const arbol = await Arbol.findByPk(id);
		if (!arbol) return res.status(404).json({ error: 'Árbol no encontrado' });
		await arbol.destroy();
		return res.status(204).end();
	} catch (err) {
		return res.status(500).json({ error: 'Error al eliminar árbol', details: err.message });
	}
}