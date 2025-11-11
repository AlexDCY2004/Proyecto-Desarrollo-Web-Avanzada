import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// Nuevo modelo que representa tipos de árbol con precio y descuentos
export const Arbol = sequelize.define(
	'Arbol',
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		tipo: { type: DataTypes.STRING(30), allowNull: false, unique: true }, // e.g. "Palto"
		precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
		rebaja100_300: { type: DataTypes.DECIMAL(5, 2), allowNull: false }, // porcentaje, e.g. 10.0
		rebajaMas300: { type: DataTypes.DECIMAL(5, 2), allowNull: false }   // porcentaje, e.g. 18.0
	},
	{
		tableName: 'arboles', timestamps: false
	}
);

