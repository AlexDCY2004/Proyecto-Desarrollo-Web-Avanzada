import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Usuario } from "./usuario.js";

export const Conductor = sequelize.define(
    'Conductor',
    {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true,
            field: 'ID_CONDUCTOR' 
        },
        id_usuario: { 
            type: DataTypes.INTEGER, 
            allowNull: true,
            field: 'ID_USUARIO'
        },
        nombre: { 
            type: DataTypes.STRING(32), 
            allowNull: false,
            field: 'CONDUCTOR_NOMBRE',
            validate: {
                notEmpty: { msg: "El nombre no puede estar vacío" },
                len: { args: [2, 32], msg: "El nombre debe tener entre 2 y 32 caracteres" },
                isAlpha: { msg: "El nombre solo puede contener letras" }
            }
        },
        apellido: { 
            type: DataTypes.STRING(32), 
            allowNull: false,
            field: 'CONDUCTOR_APELLIDO',
            validate: {
                notEmpty: { msg: "El apellido no puede estar vacío" },
                len: { args: [2, 32], msg: "El apellido debe tener entre 2 y 32 caracteres" },
                isAlpha: { msg: "El apellido solo puede contener letras" }
            }
        },
        edad: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            field: 'CONDUCTOR_EDAD',
            validate: {
                isInt: { msg: "La edad debe ser un número entero" },
                min: { args: [18], msg: "El conductor debe ser mayor de 18 años" },
                max: { args: [120], msg: "La edad debe ser válida" }
            }
        },
        tipo_licencia: { 
            type: DataTypes.STRING(8), 
            allowNull: false,
            field: 'CONDUCTOR_TIPO_LICENCIA',
            validate: {
                notEmpty: { msg: "El tipo de licencia es requerido" },
                isIn: { args: [['A', 'B', 'C', 'D', 'E']], msg: "Tipo de licencia inválido" }
            }
        },
        telefono: { 
            type: DataTypes.STRING(10), 
            allowNull: false,
            field: 'CONDUCTOR_TELEFONO',
            validate: {
                notEmpty: { msg: "El teléfono no puede estar vacío" },
                isNumeric: { msg: "El teléfono solo debe contener números" },
                len: { args: [10, 10], msg: "El teléfono debe tener 10 dígitos" }
            }
        },
        accidentes_cantidad: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            defaultValue: 0,
            field: 'CONDUCTOR_ACCIDENTES_CANTIDAD',
            validate: {
                isInt: { msg: "La cantidad de accidentes debe ser un número entero" },
                min: { args: [0], msg: "La cantidad de accidentes no puede ser negativa" }
            }
        }
    },
    {
        tableName: 'CONDUCTOR',
        timestamps: false
    }
);

// Relaciones con Usuario
Conductor.belongsTo(Usuario, { foreignKey: "id_usuario", onDelete: "CASCADE" });
Usuario.hasMany(Conductor, { foreignKey: "id_usuario", onDelete: "CASCADE" });
