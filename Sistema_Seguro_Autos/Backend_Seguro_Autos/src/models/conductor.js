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
            allowNull: true, // SQL script says null
            field: 'ID_USUARIO'
        },
        nombre: { 
            type: DataTypes.STRING(32), 
            allowNull: false,
            field: 'CONDUCTOR_NOMBRE'
        },
        apellido: { 
            type: DataTypes.STRING(32), 
            allowNull: false,
            field: 'CONDUCTOR_APELLIDO'
        },
        edad: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            field: 'CONDUCTOR_EDAD'
        },
        tipo_licencia: { 
            type: DataTypes.STRING(8), 
            allowNull: false,
            field: 'CONDUCTOR_TIPO_LICENCIA'
        },
        telefono: { 
            type: DataTypes.STRING(10), 
            allowNull: false,
            field: 'CONDUCTOR_TELEFONO'
        },
        accidentes_cantidad: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            field: 'CONDUCTOR_ACCIDENTES_CANTIDAD'
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
