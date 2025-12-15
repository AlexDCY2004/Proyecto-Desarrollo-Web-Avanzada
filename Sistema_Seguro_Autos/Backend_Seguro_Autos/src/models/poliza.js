import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Cotizacion } from "./cotizacion.js";

export const Poliza = sequelize.define(
    'Poliza',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'ID_POLIZA'
        },
        id_cotizacion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'ID_COTIZACION',
            unique: true
        },
        numero_poliza: { // Generado automatica
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true,
            field: 'POLIZA_NUMERO'
        },
        fecha_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'POLIZA_FECHA_INICIO'
        },
        fecha_fin: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'POLIZA_FECHA_FIN'
        },
        estado: {
            // Activa, Vencida, Cancelada, Suspendida
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'Activa',
            field: 'POLIZA_ESTADO'
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'POLIZA_OBSERVACIONES'
        }
    },
    {
        tableName: 'POLIZA',
        timestamps: true, // Para auditoria simple (createdAt, updatedAt)
        updatedAt: 'FECHA_MODIFICACION',
        createdAt: 'FECHA_CREACION'
    }
);

// Relaciones
Poliza.belongsTo(Cotizacion, { foreignKey: "id_cotizacion", onDelete: "RESTRICT" });
// One-to-One: Cotizacion hasOne Poliza
Cotizacion.hasOne(Poliza, { foreignKey: "id_cotizacion", onDelete: "RESTRICT" });
