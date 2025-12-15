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
            unique: true,
            field: 'USUARIO_NOMBRE',
            validate: {
                notEmpty: { msg: "El nombre de usuario no puede estar vacío" },
                len: { args: [3, 32], msg: "El nombre de usuario debe tener entre 3 y 32 caracteres" },
                isAlphanumeric: { msg: "El nombre de usuario solo puede contener letras y números" }
            }
        },
        contrasenia: { 
            type: DataTypes.STRING(100), 
            allowNull: false,
            field: 'USUARIO_CONTRASENIA',
            validate: {
                notEmpty: { msg: "La contraseña no puede estar vacía" },
                len: { args: [8, 100], msg: "La contraseña debe tener mínimo 8 caracteres" },
                customValidator(value) {
                    if (value.includes(' ')) {
                        throw new Error("La contraseña no puede contener espacios");
                    }
                }
            }
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
