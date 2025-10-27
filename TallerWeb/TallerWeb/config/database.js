export default async function connectDB() {

	try {
		const dot = await import('dotenv');
		dot.config();
	} catch (e) {
		console.warn(
		);
	}


	let Sequelize;
	try {
		const mod = await import('sequelize');
		Sequelize = mod.Sequelize;
	} catch (err) {
		console.error("Paquete 'sequelize' no encontrado. Instala las dependencias necesarias:");
		console.error("  npm install sequelize mysql2 --save");
		throw err;
	}

	const createSequelize = () => new Sequelize(
		process.env.DB_NAME,
		process.env.DB_USER,
		process.env.DB_PASS,
		{
			host: process.env.DB_HOST || 'localhost',
			port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
			dialect: 'mysql',
			logging: false,
		}
	);

	let sequelize = createSequelize();

	try {
		await sequelize.authenticate();
		console.log('Conectado a la base de datos (MySQL).');
		connectDB.sequelize = sequelize;
		return sequelize;
	} catch (err) {

		const isUnknownDb = err?.parent?.code === 'ER_BAD_DB_ERROR' || err?.parent?.errno === 1049;
		if (isUnknownDb) {
			console.warn(`Base de datos '${process.env.DB_NAME}' no encontrada. Intentando crearla...`);
			try {
				let mysql;
				try {
					mysql = await import('mysql2/promise');
				} catch (e) {
					console.error("Paquete 'mysql2' no encontrado. Instala: npm install mysql2 --save");
					throw e;
				}

				const connConfig = {
					host: process.env.DB_HOST || 'localhost',
					user: process.env.DB_USER,
					password: process.env.DB_PASS,
					port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
					multipleStatements: true,
				};

				const connection = await mysql.createConnection(connConfig);
				const dbName = process.env.DB_NAME;
				await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
				await connection.end();
				console.log(`Base de datos '${dbName}' creada (si no existía). Intentando reconectar...`);

				sequelize = createSequelize();
				await sequelize.authenticate();
				console.log('Conectado a la base de datos (MySQL) tras crearla.');
				connectDB.sequelize = sequelize;
				return sequelize;
			} catch (createErr) {
				console.error('No se pudo crear la base de datos automáticamente:', createErr);
				throw createErr;
			}
		}

		console.error('No se pudo conectar a la base de datos:', err);
		throw err;
	}
}

