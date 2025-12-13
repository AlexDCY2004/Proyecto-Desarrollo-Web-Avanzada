import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Vehiculo = sequelize.define(
    'Vehiculo',
    {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true,
            field: 'ID_VEHICULO'
        },
        modelo: { 
            type: DataTypes.STRING(32), 
            allowNull: false,
            field: 'VEHICULO_MODELO'
        },
        color: { 
            type: DataTypes.STRING(16), 
            allowNull: false,
            field: 'VEHICULO_COLOR'
        },
        tipo: { 
            type: DataTypes.STRING(16), 
            allowNull: false,
            field: 'VEHICULO_TIPO'
        },
        uso: { 
            type: DataTypes.STRING(16), 
            allowNull: false,
            field: 'VEHICULO_USO'
        },
        precio: { 
            type: DataTypes.STRING(16), 
            allowNull: false,
            field: 'VEHICULO_PRECIO'
        }
    },
    {
        tableName: 'VEHICULO',
        timestamps: false
    }
);
