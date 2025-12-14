import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Docente } from "./docente.js";

export const Asignatura = sequelize.define(
    'Asignatura', //representa la tabla asignaturas
    {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        nombre: {type: DataTypes.STRING(50), allowNull: false},
        codigo: {type: DataTypes.STRING(10), allowNull: false, unique: true},
        creditos: {type: DataTypes.INTEGER, allowNull: false},
        docenteId: { type: DataTypes.INTEGER, allowNull: true } 
    },
    {
        tableName: 'asignaturas', timestamps: false //representa el nombre de la tabla en la base de datos
    }
);

// Asociación local para evitar imports circulares
Asignatura.belongsTo(Docente, { foreignKey: 'docenteId', onDelete: 'SET NULL' });