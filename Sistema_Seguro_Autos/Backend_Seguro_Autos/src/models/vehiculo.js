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
            field: 'VEHICULO_MODELO',
            validate: {
                notEmpty: { msg: "El modelo del vehículo no puede estar vacío" },
                len: { args: [2, 32], msg: "El modelo debe tener entre 2 y 32 caracteres" }
            }
        },
        anio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'VEHICULO_ANIO',
            validate: {
                isInt: { msg: "El año debe ser un número entero" },
                min: { args: [1900], msg: "El año debe ser válido" },
                max: { args: [new Date().getFullYear()], msg: "El año no puede ser futuro" },
                customValidator(value) {
                    const antigüedad = new Date().getFullYear() - value;
                    if (antigüedad > 20) {
                        throw new Error("Vehículos con más de 20 años no pueden ser cotizados");
                    }
                }
            }
        },
        color: {
            type: DataTypes.STRING(16),
            allowNull: false,
            field: 'VEHICULO_COLOR',
            validate: {
                notEmpty: { msg: "El color no puede estar vacío" },
                len: { args: [3, 16], msg: "El color debe tener entre 3 y 16 caracteres" }
            }
        },
        tipo: {
            type: DataTypes.STRING(16),
            allowNull: false,
            field: 'VEHICULO_TIPO',
            validate: {
                notEmpty: { msg: "El tipo de vehículo es requerido" },
                isIn: { args: [['Sedan', 'Sedán', 'SUV', 'Camioneta', 'Auto', 'Compacto', 'Deportivo']], msg: "Tipo de vehículo no válido" }
            }
        },
        uso: {
            type: DataTypes.STRING(16),
            allowNull: false,
            field: 'VEHICULO_USO',
            validate: {
                notEmpty: { msg: "El uso del vehículo es requerido" },
                isIn: { args: [['Personal', 'Comercial', 'Particular', 'Privado']], msg: "Uso no válido. Use: Personal, Comercial, Particular, Privado" }
            }
        },
        precio: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: 'VEHICULO_PRECIO',
            validate: {
                isDecimal: { msg: "El precio debe ser un número válido" },
                min: { args: [0], msg: "El precio no puede ser negativo" },
                notEmpty: { msg: "El precio es requerido" }
            }
        }
    },
    {
        tableName: 'VEHICULO',
        timestamps: false
    }
);
