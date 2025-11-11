import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Arbol } from "./arbol.js";

export const Compra = sequelize.define(
	'Compra',
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
		compradorNombre: { type: DataTypes.STRING(100), allowNull: false }, // <-- nuevo campo
		subtotal: { type: DataTypes.DECIMAL(12,2), allowNull: false },
		subtotalConDescuento: { type: DataTypes.DECIMAL(12,2), allowNull: false },
		iva: { type: DataTypes.DECIMAL(12,2), allowNull: false },
		total: { type: DataTypes.DECIMAL(12,2), allowNull: false },
		totalCantidad: { type: DataTypes.INTEGER, allowNull: false }
	},
	{ tableName: 'compras', timestamps: false }
);

export const CompraItem = sequelize.define(
	'CompraItem',
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		compraId: { type: DataTypes.INTEGER, allowNull: false },
		arbolId: { type: DataTypes.INTEGER, allowNull: false }, // FK al arbol
		cantidad: { type: DataTypes.INTEGER, allowNull: false }
	},
	{ tableName: 'compra_items', timestamps: false }
);

// asociaciones
Compra.hasMany(CompraItem, { foreignKey: 'compraId', as: 'items' });
CompraItem.belongsTo(Compra, { foreignKey: 'compraId', as: 'compra' });

// Relación entre CompraItem y Arbol (un item referencia un arbol)
CompraItem.belongsTo(Arbol, { foreignKey: 'arbolId', as: 'arbol' });
Arbol.hasMany(CompraItem, { foreignKey: 'arbolId', as: 'compraItems' });
