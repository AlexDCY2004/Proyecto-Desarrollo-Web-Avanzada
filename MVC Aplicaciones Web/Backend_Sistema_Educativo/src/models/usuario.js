import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Usuario = sequelize.define(
    'Usuario',
    {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: "El usuario no puede estar vacío" }
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: { msg: "La contraseña no puede estar vacía" }
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: { msg: "Email inválido" }
            }
        },
        rol: {
            type: DataTypes.ENUM('admin', 'docente', 'estudiante'),
            allowNull: false,
            defaultValue: 'estudiante'
        },
        estado: {
            type: DataTypes.ENUM('activo', 'inactivo'),
            allowNull: false,
            defaultValue: 'activo'
        }
    },
    {
        tableName: 'usuarios',
        timestamps: false
    }
);
