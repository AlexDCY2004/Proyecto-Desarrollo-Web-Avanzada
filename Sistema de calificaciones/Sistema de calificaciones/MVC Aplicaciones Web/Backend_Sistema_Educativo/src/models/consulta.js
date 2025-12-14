import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Usuario } from "./usuario.js";

export const Consulta = sequelize.define(
    'Consulta',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        usuarioId: { type: DataTypes.INTEGER, allowNull: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        email: { type: DataTypes.STRING(100), allowNull: false, validate: { isEmail: true } },
        asunto: { type: DataTypes.STRING(200), allowNull: false },
        mensaje: { type: DataTypes.TEXT, allowNull: false },
        tipo: { 
            type: DataTypes.ENUM('consulta', 'problema', 'sugerencia', 'otro'), 
            allowNull: false, 
            defaultValue: 'consulta' 
        },
        estado: { 
            type: DataTypes.ENUM('pendiente', 'en proceso', 'resuelto', 'cerrado'), 
            allowNull: false, 
            defaultValue: 'pendiente' 
        },
        respuesta: { type: DataTypes.TEXT, allowNull: true },
        fechaCreacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        fechaRespuesta: { type: DataTypes.DATE, allowNull: true }
    },
    {
        tableName: 'consultas',
        timestamps: true,
        createdAt: 'fechaCreacion',
        updatedAt: false
    }
);

// Relación: una Consulta puede pertenecer a un Usuario (opcional)
Consulta.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
