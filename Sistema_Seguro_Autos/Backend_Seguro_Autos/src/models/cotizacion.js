import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Usuario } from "./usuario.js";
import { Conductor } from "./conductor.js";
import { Vehiculo } from "./vehiculo.js";
import { MetodoPago } from "./metodoPago.js";

export const Cotizacion = sequelize.define(
    'Cotizacion',
    {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true,
            field: 'ID_COTIZACION'
        },
        id_usuario: { 
            type: DataTypes.INTEGER, 
            allowNull: true,
            field: 'ID_USUARIO'
        },
        id_vehiculo: { 
            type: DataTypes.INTEGER, 
            allowNull: true,
            field: 'ID_VEHICULO'
        },
        id_pago: { 
            type: DataTypes.INTEGER, 
            allowNull: true,
            field: 'ID_PAGO'
        },
        id_conductor: { 
            type: DataTypes.INTEGER, 
            allowNull: true,
            field: 'ID_CONDUCTOR'
        },
        fecha_emision: { 
            type: DataTypes.DATE, 
            allowNull: false,
            field: 'COTIZACION_FECHA_EMISION'
        },
        costo_base: { 
            type: DataTypes.FLOAT, 
            allowNull: false,
            field: 'COTIZACION_COSTO_BASE'
        },
        descuento: { 
            type: DataTypes.FLOAT, 
            allowNull: false,
            field: 'COTIZACION_DESCUENTO'
        },
        recargo: { 
            type: DataTypes.FLOAT, 
            allowNull: false,
            defaultValue: 0,
            field: 'COTIZACION_RECARGO'
        },
        costo_final: { 
            type: DataTypes.FLOAT, 
            allowNull: false,
            field: 'COTIZACION_COSTO_FINAL'
        },
        fecha_caducidad: { 
            type: DataTypes.DATE, 
            allowNull: false,
            field: 'COTIZACION_FECHA_CADUCIDAD'
        },
        estado: { 
            type: DataTypes.BOOLEAN, 
            allowNull: false,
            field: 'COTIZACION_ESTADO'
        },
        motivo_rechazo: { 
            type: DataTypes.TEXT, 
            allowNull: true 
        }
    },
    {
        tableName: 'COTIZACION',
        timestamps: false,
        hooks: {
            beforeValidate: async (cotizacion) => {
                let rechazo = [];
                let recargo = 0;
                let descuento = 0;

                // Obtener datos relacionados
                const conductor = await Conductor.findByPk(cotizacion.id_conductor);
                const vehiculo = await Vehiculo.findByPk(cotizacion.id_vehiculo);
                const metodoPago = await MetodoPago.findByPk(cotizacion.id_pago);

                if (!conductor || !vehiculo || !metodoPago) {
                    throw new Error("Datos incompletos para la cotización");
                }

                // COSTO BASE = Precio del vehículo
                let costoBase = parseFloat(vehiculo.precio.replace(/[^0-9.-]+/g,""));

                // --- Reglas Conductor ---
                const edad = conductor.edad;
                if (edad < 18) {
                    rechazo.push("Conductor menor de 18 años");
                } else if (edad >= 18 && edad <= 24) {
                    recargo += costoBase * 0.20; // Recargo joven
                } else if (edad > 65) {
                    if (edad > 75) {
                        rechazo.push("Conductor mayor de 75 años");
                    } else {
                        recargo += costoBase * 0.10; // Recargo edad avanzada
                    }
                }

                const accidentes = conductor.accidentes_cantidad;
                if (accidentes === 0) {
                    descuento += costoBase * 0.10; // Descuento sin accidentes
                } else {
                    recargo += costoBase * 0.05 * accidentes; // Recargo por accidente
                    if (accidentes > 3) {
                        rechazo.push("Exceso de accidentes (>3)");
                    }
                }

                // --- Reglas Vehículo ---
                // Costo base según tipo
                if (vehiculo.tipo.toLowerCase().includes('suv') || vehiculo.tipo.toLowerCase().includes('camioneta')) {
                    recargo += costoBase * 0.15; // Incremento por tipo
                }
                
                if (vehiculo.uso.toLowerCase() === 'comercial') {
                    recargo += costoBase * 0.15;
                }

                // --- Reglas Método de Pago ---
                const tipoPagoLower = metodoPago.tipo.toLowerCase().trim();
                if (tipoPagoLower.includes('tarjeta') && tipoPagoLower.includes('crédito')) {
                    descuento += costoBase * 0.05;
                } else if (tipoPagoLower.includes('tarjeta') && tipoPagoLower.includes('credito')) {
                    descuento += costoBase * 0.05;
                } else if (tipoPagoLower.includes('cuotas')) {
                    recargo += costoBase * 0.10;
                }

                // --- Cálculo Final ---
                cotizacion.costo_base = costoBase;
                cotizacion.recargo = recargo;
                cotizacion.descuento = descuento;
                // Costo final = Base + Recargos - Descuentos
                cotizacion.costo_final = costoBase + recargo - descuento;

                // --- Validación Final ---
                if (rechazo.length > 0) {
                    cotizacion.estado = false; // Rechazada/Invalida
                    cotizacion.motivo_rechazo = rechazo.join("; ");
                } else {
                    cotizacion.estado = true; // Aprobada/Valida
                    cotizacion.motivo_rechazo = null;
                }
            }
        }
    }
);

// Relaciones
Cotizacion.belongsTo(Usuario, { foreignKey: "id_usuario", onDelete: "CASCADE" });
Usuario.hasMany(Cotizacion, { foreignKey: "id_usuario", onDelete: "CASCADE" });

Cotizacion.belongsTo(Conductor, { foreignKey: "id_conductor", onDelete: "CASCADE" });
Conductor.hasMany(Cotizacion, { foreignKey: "id_conductor", onDelete: "CASCADE" });

Cotizacion.belongsTo(Vehiculo, { foreignKey: "id_vehiculo", onDelete: "CASCADE" });
Vehiculo.hasMany(Cotizacion, { foreignKey: "id_vehiculo", onDelete: "CASCADE" });

Cotizacion.belongsTo(MetodoPago, { foreignKey: "id_pago", onDelete: "CASCADE" });
MetodoPago.hasMany(Cotizacion, { foreignKey: "id_pago", onDelete: "CASCADE" });
