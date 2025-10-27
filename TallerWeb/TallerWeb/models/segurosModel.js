// Cambiado: exportar función async initCliente que recibe la instancia sequelize
export default async function initCliente(sequelize) {
	// Importar DataTypes dinámicamente (evita ERR_MODULE_NOT_FOUND en carga del módulo)
	let DataTypes;
	try {
		const mod = await import('sequelize');
		DataTypes = mod.DataTypes;
	} catch (err) {
		console.error("Paquete 'sequelize' no encontrado. Instala: npm install sequelize mysql2 --save");
		throw err;
	}

	// Define el modelo Cliente
	const Cliente = sequelize.define('Cliente', {
		monto: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		cuota: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
	}, {
		tableName: 'clientes',
		timestamps: false,
		hooks: {
			// Antes de validar/crear/actualizar, calcular la cuota según la regla:
			// monto < 50000 => 3% ; de lo contrario => 2% (incluye monto == 50000)
			beforeValidate(instance) {
				const m = parseFloat(instance.monto) || 0;
				if (m < 50000) {
					instance.cuota = +(m * 0.03).toFixed(2);
				} else {
					instance.cuota = +(m * 0.02).toFixed(2);
				}
			},
		},
	});

	return Cliente;
}

// Lógica de cálculo de cuota ya implementada en hook beforeValidate (monto<50000 => 3%, else 2%)
