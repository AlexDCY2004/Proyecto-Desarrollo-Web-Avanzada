import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Docente = sequelize.define(
    "Docente",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.STRING(100), allowNull: false },
        cedula: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            set(value) { this.setDataValue('cedula', value?.trim()); },
            validate: {
                notEmpty: { msg: "La cédula no puede estar vacía" },
                notNull: { msg: "La cédula es obligatoria" }
            }
        },
        email: { type: DataTypes.STRING(100), allowNull: true, validate: { isEmail: true } },
        telefono: { type: DataTypes.STRING(20), allowNull: true },
        direccion: { type: DataTypes.STRING(200), allowNull: true },
        fechaContratacion: { type: DataTypes.DATE, allowNull: true },
        especialidad: { type: DataTypes.STRING(100), allowNull: true },
        horasLaborales: { type: DataTypes.STRING(100), allowNull: true },
        departamento: { type: DataTypes.STRING(100), allowNull: false }
    },
    {
        tableName: "docentes", timestamps: false
    }
);