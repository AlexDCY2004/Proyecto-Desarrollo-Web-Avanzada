import connectDB from '../config/database.js';

// Helper para obtener el modelo Cliente que app.js inicializa y adjunta a connectDB
const getModel = () => {
	if (!connectDB || !connectDB.Cliente) {
		throw new Error('Modelo Cliente no inicializado. Asegúrate de llamar a connectDB() e inicializar el modelo antes de montar las rutas.');
	}
	return connectDB.Cliente;
};

const list = async (req, res) => {
	try {
		const Modelo = getModel();
		const items = await Modelo.findAll();
		return res.json(items);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

const getById = async (req, res) => {
	try {
		const id = req.params.id;
		const Modelo = getModel();
		const item = await Modelo.findByPk(id);
		if (!item) return res.status(404).json({ error: 'No encontrado' });
		return res.json(item);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

const create = async (req, res) => {
	try {
		const { monto } = req.body;
		if (typeof monto === 'undefined') return res.status(400).json({ error: 'Falta campo monto' });
		const Modelo = getModel();
		const nuevo = await Modelo.create({ monto });
		return res.status(201).json(nuevo);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

const update = async (req, res) => {
	try {
		const id = req.params.id;
		const { monto } = req.body;
		const Modelo = getModel();
		const item = await Modelo.findByPk(id);
		if (!item) return res.status(404).json({ error: 'No encontrado' });
		if (typeof monto !== 'undefined') item.monto = monto;
		await item.save(); // hook beforeValidate recalculará cuota
		return res.json(item);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

const remove = async (req, res) => {
	try {
		const id = req.params.id;
		const Modelo = getModel();
		const item = await Modelo.findByPk(id);
		if (!item) return res.status(404).json({ error: 'No encontrado' });
		await item.destroy();
		return res.status(204).send();
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

export default { list, getById, create, update, remove };
