import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Curso = sequelize.define(
    "Curso",
    {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        nombre: { 
            type: DataTypes.STRING(100), 
            allowNull: false, 
            unique: true,
            set(value) { 
                this.setDataValue('nombre', value?.trim()); 
            },
            validate: {
                notEmpty: { msg: "El nombre del curso no puede estar vacío" },
                notNull: { msg: "El nombre del curso es obligatorio" }
            }
        },
        nivel: { 
            type: DataTypes.STRING(50), 
            allowNull: true,
            comment: "Ejemplo: Primero, Segundo, Tercero, etc."
        },
        paralelo: { 
            type: DataTypes.STRING(10), 
            allowNull: true,
            comment: "Ejemplo: A, B, C, D"
        },
        anio: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 2020,
                max: 2100
            },
            
        },
        capacidad: { 
            type: DataTypes.INTEGER, 
            allowNull: true,
            defaultValue: 30,
            validate: {
                min: 1,
                max: 100
            },
            
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        estado: { 
            type: DataTypes.ENUM('activo', 'inactivo'), 
            allowNull: false,
            defaultValue: 'activo' 
        }
    },
    {
        tableName: "cursos",
        timestamps: false
    }
);

// Nota: las asociaciones con Estudiante se declaran en estudiante.js para evitar imports circulares.

