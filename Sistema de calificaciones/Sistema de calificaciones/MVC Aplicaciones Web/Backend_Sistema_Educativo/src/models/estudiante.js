import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Curso } from "./curso.js";

export const Estudiante = sequelize.define(
    'Estudiante', //representa la tabla estudiantes
    {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
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
        nombre: {type: DataTypes.STRING(50), allowNull: false},
        email: {type: DataTypes.STRING(100), allowNull: true, validate: {isEmail: true}},
        telefono: {type: DataTypes.STRING(20), allowNull: true},
        direccion: {type: DataTypes.STRING(200), allowNull: true},
        fechaNacimiento: {type: DataTypes.DATE, allowNull: true},
        foto: {type: DataTypes.TEXT, allowNull: true},
        estado: {type: DataTypes.ENUM('activo', 'inactivo'), allowNull: false, defaultValue: 'activo'},
        cursoId: { type: DataTypes.INTEGER, allowNull: true }, // FK hacia cursos
    },
    {
        tableName: 'estudiantes', timestamps: false //representa el nombre de la tabla en la base de datos
    }


);

// Relación: un Estudiante pertenece a un Curso
Estudiante.belongsTo(Curso, { foreignKey: 'cursoId' });
// Registrar la relación complementaria: un Curso tiene muchos Estudiantes
Curso.hasMany(Estudiante, { foreignKey: 'cursoId', onDelete: 'SET NULL' });

