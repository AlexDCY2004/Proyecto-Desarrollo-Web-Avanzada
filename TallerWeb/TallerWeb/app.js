import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import segurosRouter from './routes/segurosRouter.js';
import initCliente from './models/segurosModel.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // reemplaza body-parser

// Conectar la base de datos y arrancar el servidor de forma segura
(async function start() {
	try {
		await connectDB();
		// Inicializar modelo Cliente y sincronizar tablas
		const Cliente = await initCliente(connectDB.sequelize);
		// Exponer modelo para que controladores puedan usarlo si lo necesitan
		connectDB.Cliente = Cliente;
		await connectDB.sequelize.sync(); // crea tablas si no existen

		// Rutas (montadas con base path)
		app.use('/api/seguros', segurosRouter);

		const port = parseInt(process.env.PORT, 10) || 3000;
		app.listen(port, () => {
			console.log(`Servidor corriendo en el puerto ${port}`);
		});
	} catch (err) {
		console.error('Error al iniciar la aplicación:', err);
		process.exit(1);
	}
})();

// Manejador de errores simple
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: 'Error interno del servidor' });
});

// No changes necesarios para las pruebas; arranca con: npm start
