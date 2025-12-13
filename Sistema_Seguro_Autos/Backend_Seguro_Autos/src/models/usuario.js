import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Usuario = sequelize.define(
    'Usuario',
    {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true,
            field: 'ID_USUARIO' 
        },
        nombre: { 
            type: DataTypes.STRING(32), 
            allowNull: false,
            field: 'USUARIO_NOMBRE'
        },
        contrasenia: { 
            type: DataTypes.STRING(32), 
            allowNull: false,
            field: 'USUARIO_CONTRASENIA'
        },
        estado: { 
            type: DataTypes.BOOLEAN, 
            allowNull: false, 
            defaultValue: true,
            field: 'USUARIO_ESTADO'
        },
        fecha_registro: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW,
            field: 'USUARIO_FECHA_REGISTRO'
        }
    },
    {
        tableName: 'USUARIO',
        timestamps: false
    }
);
