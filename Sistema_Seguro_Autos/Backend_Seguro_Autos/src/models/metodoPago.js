import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const MetodoPago = sequelize.define(
    'MetodoPago',
    {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true,
            field: 'ID_PAGO'
        },
        tipo: { 
            type: DataTypes.STRING(32), 
            allowNull: false,
            field: 'PAGO_TIPO'
        },
        estado_validacion: { 
            type: DataTypes.STRING(16), 
            allowNull: false,
            defaultValue: 'Pendiente',
            field: 'PAGO_ESTADO_VALIDACION'
        }
    },
    {
        tableName: 'METODO_PAGO',
        timestamps: false
    }
);
