import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Cotizacion } from "./cotizacion.js";

export const Poliza = sequelize.define(
    'Poliza',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'ID_POLIZA'
        },
        id_cotizacion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'ID_COTIZACION',
            unique: true,
            validate: {
                notNull: { msg: "La cotización es requerida" }
            }
        },
        numero_poliza: {
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true,
            field: 'POLIZA_NUMERO',
            validate: {
                notEmpty: { msg: "El número de póliza no puede estar vacío" }
            }
        },
        fecha_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'POLIZA_FECHA_INICIO',
            validate: {
                isDate: { msg: "Fecha de inicio inválida" },
                customValidator(value) {
                    const hoy = new Date();
                    const fecha = new Date(value);
                    if (fecha < hoy) {
                        throw new Error("La fecha de inicio no puede ser anterior a la fecha actual");
                    }
                }
            }
        },
        fecha_fin: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'POLIZA_FECHA_FIN',
            validate: {
                isDate: { msg: "Fecha de fin inválida" },
                isAfter: function() {
                    return this.fecha_inicio ? this.fecha_inicio.toString() : null;
                }
            }
        },
        estado: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'Activa',
            field: 'POLIZA_ESTADO',
            validate: {
                isIn: { args: [['Activa', 'Vencida', 'Cancelada', 'Suspendida']], msg: "Estado inválido. Use: Activa, Vencida, Cancelada, Suspendida" }
            }
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'POLIZA_OBSERVACIONES'
        }
    },
    {
        tableName: 'POLIZA',
        timestamps: true,
        updatedAt: 'FECHA_MODIFICACION',
        createdAt: 'FECHA_CREACION',
        hooks: {
            beforeValidate: (poliza) => {
                // Validar que fecha_fin sea 1 año después de fecha_inicio
                if (poliza.fecha_inicio && !poliza.fecha_fin) {
                    const inicio = new Date(poliza.fecha_inicio);
                    const fin = new Date(inicio);
                    fin.setFullYear(fin.getFullYear() + 1);
                    poliza.fecha_fin = fin;
                }
            },
            beforeUpdate: (poliza) => {
                // No permitir cambios en pólizas canceladas
                if (poliza.estado === 'Cancelada') {
                    throw new Error("No se puede modificar una póliza cancelada");
                }
                
                // Auto-actualizar estado a Vencida si llegó la fecha
                const hoy = new Date();
                if (poliza.fecha_fin && new Date(poliza.fecha_fin) < hoy && poliza.estado === 'Activa') {
                    poliza.estado = 'Vencida';
                }
            }
        }
    }
);

// Relaciones
Poliza.belongsTo(Cotizacion, { foreignKey: "id_cotizacion", onDelete: "RESTRICT" });
Cotizacion.hasOne(Poliza, { foreignKey: "id_cotizacion", onDelete: "RESTRICT" });
