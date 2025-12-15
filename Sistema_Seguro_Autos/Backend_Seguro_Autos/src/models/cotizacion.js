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
            allowNull: false,
            field: 'ID_USUARIO',
            validate: {
                notNull: { msg: "El usuario es requerido" }
            }
        },
        id_vehiculo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'ID_VEHICULO',
            validate: {
                notNull: { msg: "El vehículo es requerido" }
            }
        },
        id_pago: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'ID_PAGO',
            validate: {
                notNull: { msg: "El método de pago es requerido" }
            }
        },
        id_conductor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'ID_CONDUCTOR',
            validate: {
                notNull: { msg: "El conductor es requerido" }
            }
        },
        fecha_emision: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'COTIZACION_FECHA_EMISION'
        },
        costo_base: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            field: 'COTIZACION_COSTO_BASE',
            validate: {
                min: { args: [0], msg: "El costo base no puede ser negativo" }
            }
        },
        descuento: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            field: 'COTIZACION_DESCUENTO',
            validate: {
                min: { args: [0], msg: "El descuento no puede ser negativo" }
            }
        },
        recargo: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            field: 'COTIZACION_RECARGO',
            validate: {
                min: { args: [0], msg: "El recargo no puede ser negativo" }
            }
        },
        costo_final: {
            type: DataTypes.FLOAT,
            allowNull: false,
            field: 'COTIZACION_COSTO_FINAL',
            validate: {
                min: { args: [0], msg: "El costo final no puede ser negativo" }
            }
        },
        fecha_caducidad: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'COTIZACION_FECHA_CADUCIDAD',
            validate: {
                isDate: { msg: "Fecha de caducidad inválida" },
                isAfter: function() {
                    return this.fecha_emision ? this.fecha_emision.toString() : null;
                }
            }
        },
        estado: {
            type: DataTypes.STRING(16),
            allowNull: false,
            defaultValue: 'Pendiente',
            field: 'COTIZACION_ESTADO',
            validate: {
                isIn: { args: [['Pendiente', 'Aprobada', 'Rechazada']], msg: "Estado inválido. Use: Pendiente, Aprobada, Rechazada" }
            }
        },
        motivo_rechazo: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'COTIZACION_MOTIVO_RECHAZO'
        },
        acepta_terminos: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'COTIZACION_ACEPTA_TERMINOS',
            validate: {
                notNull: { msg: "Debe aceptar los términos y condiciones" }
            }
        }
    },
    {
        tableName: 'COTIZACION',
        timestamps: false,
        hooks: {
            beforeCreate: async (cotizacion) => {
                // Ejecutar cálculos antes de crear
                if (!cotizacion.id_conductor || !cotizacion.id_vehiculo || !cotizacion.id_pago) {
                    return;
                }

                let rechazo = [];
                let recargo = 0;
                let descuento = 0;

                try {
                    // Obtener datos relacionados
                    const conductor = await Conductor.findByPk(cotizacion.id_conductor);
                    const vehiculo = await Vehiculo.findByPk(cotizacion.id_vehiculo);
                    const metodoPago = await MetodoPago.findByPk(cotizacion.id_pago);

                    if (!conductor || !vehiculo || !metodoPago) {
                        throw new Error("Datos incompletos para la cotización");
                    }

                    // COSTO BASE = Precio del vehículo
                    let costoBase = parseFloat(vehiculo.precio.toString().replace(/[^0-9.-]+/g, "")) || 0;
                    if (isNaN(costoBase) || costoBase <= 0) {
                        throw new Error("Precio del vehículo inválido");
                    }

                    // --- Reglas Conductor ---
                    const edad = conductor.edad;
                    if (edad < 18) {
                        rechazo.push("Conductor menor de 18 años - No se puede cotizar");
                    } else if (edad >= 18 && edad <= 24) {
                        recargo += costoBase * 0.20; // Recargo joven 20%
                    } else if (edad > 65 && edad <= 75) {
                        recargo += costoBase * 0.10; // Recargo edad avanzada 10%
                    } else if (edad > 75) {
                        rechazo.push("Conductor mayor de 75 años - Rechazo automático");
                    }

                    const accidentes = conductor.accidentes_cantidad || 0;
                    if (accidentes === 0) {
                        descuento += costoBase * 0.10; // Descuento 10% sin accidentes
                    } else if (accidentes > 0 && accidentes <= 3) {
                        recargo += costoBase * 0.05 * accidentes; // 5% por cada accidente
                    } else if (accidentes > 3) {
                        rechazo.push("Más de 3 accidentes registrados - Riesgo alto");
                    }

                    // --- Reglas Vehículo ---
                    const tipoVehiculo = vehiculo.tipo.toLowerCase();
                    if (tipoVehiculo.includes('suv') || tipoVehiculo.includes('camioneta')) {
                        recargo += costoBase * 0.15; // Incremento 15% por tipo
                    }

                    // Check Antigüedad > 20 años
                    const anioActual = new Date().getFullYear();
                    if (vehiculo.anio && (anioActual - vehiculo.anio) > 20) {
                        rechazo.push("Vehículo con más de 20 años de antigüedad - No se puede cotizar");
                    }

                    if (vehiculo.uso.toLowerCase() === 'comercial') {
                        recargo += costoBase * 0.15; // Recargo 15% uso comercial
                    }

                    // --- Reglas Método de Pago ---
                    const tipoPagoLower = (metodoPago.tipo || '').toLowerCase().trim();
                    if (tipoPagoLower.includes('crédito') || tipoPagoLower.includes('credito')) {
                        descuento += costoBase * 0.05; // Descuento 5% crédito anual
                    }
                    if (tipoPagoLower.includes('cuota') || tipoPagoLower.includes('cuotas')) {
                        recargo += costoBase * 0.10; // Recargo 10% cuotas
                    }

                    // --- Cálculo Final ---
                    cotizacion.costo_base = parseFloat(costoBase.toFixed(2));
                    cotizacion.recargo = parseFloat(recargo.toFixed(2));
                    cotizacion.descuento = parseFloat(descuento.toFixed(2));
                    cotizacion.costo_final = parseFloat((costoBase + recargo - descuento).toFixed(2));

                    // --- Validación Final ---
                    if (rechazo.length > 0) {
                        cotizacion.estado = 'Rechazada';
                        cotizacion.motivo_rechazo = rechazo.join(" | ");
                    } else {
                        cotizacion.estado = 'Pendiente';
                        cotizacion.motivo_rechazo = null;
                    }

                    // Asegurar fecha de caducidad
                    if (!cotizacion.fecha_caducidad) {
                        const hoy = new Date();
                        cotizacion.fecha_caducidad = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
                    }

                    if (!cotizacion.fecha_emision) {
                        cotizacion.fecha_emision = new Date();
                    }

                    console.log("Cotización calculada:", {
                        costoBase: cotizacion.costo_base,
                        recargo: cotizacion.recargo,
                        descuento: cotizacion.descuento,
                        costoFinal: cotizacion.costo_final,
                        estado: cotizacion.estado
                    });
                } catch (error) {
                    console.error("Error en beforeCreate de cotización:", error);
                    throw new Error("Error en cálculo de cotización: " + error.message);
                }
            },
            beforeValidate: async (cotizacion) => {
                // No ejecutar si es un update sin cambios en datos relevantes
                if (!cotizacion.id_conductor || !cotizacion.id_vehiculo || !cotizacion.id_pago) {
                    return;
                }

                let rechazo = [];
                let recargo = 0;
                let descuento = 0;

                try {
                    // Obtener datos relacionados
                    const conductor = await Conductor.findByPk(cotizacion.id_conductor);
                    const vehiculo = await Vehiculo.findByPk(cotizacion.id_vehiculo);
                    const metodoPago = await MetodoPago.findByPk(cotizacion.id_pago);

                    if (!conductor || !vehiculo || !metodoPago) {
                        throw new Error("Datos incompletos para la cotización");
                    }

                    // COSTO BASE = Precio del vehículo
                    let costoBase = parseFloat(vehiculo.precio.toString().replace(/[^0-9.-]+/g, "")) || 0;
                    if (isNaN(costoBase) || costoBase <= 0) {
                        throw new Error("Precio del vehículo inválido");
                    }

                    // --- Reglas Conductor ---
                    const edad = conductor.edad;
                    if (edad < 18) {
                        rechazo.push("Conductor menor de 18 años - No se puede cotizar");
                    } else if (edad >= 18 && edad <= 24) {
                        recargo += costoBase * 0.20; // Recargo joven 20%
                    } else if (edad > 65 && edad <= 75) {
                        recargo += costoBase * 0.10; // Recargo edad avanzada 10%
                    } else if (edad > 75) {
                        rechazo.push("Conductor mayor de 75 años - Rechazo automático");
                    }

                    const accidentes = conductor.accidentes_cantidad || 0;
                    if (accidentes === 0) {
                        descuento += costoBase * 0.10; // Descuento 10% sin accidentes
                    } else if (accidentes > 0 && accidentes <= 3) {
                        recargo += costoBase * 0.05 * accidentes; // 5% por cada accidente
                    } else if (accidentes > 3) {
                        rechazo.push("Más de 3 accidentes registrados - Riesgo alto");
                    }

                    // --- Reglas Vehículo ---
                    const tipoVehiculo = vehiculo.tipo.toLowerCase();
                    if (tipoVehiculo.includes('suv') || tipoVehiculo.includes('camioneta')) {
                        recargo += costoBase * 0.15; // Incremento 15% por tipo
                    }

                    // Check Antigüedad > 20 años
                    const anioActual = new Date().getFullYear();
                    if (vehiculo.anio && (anioActual - vehiculo.anio) > 20) {
                        rechazo.push("Vehículo con más de 20 años de antigüedad - No se puede cotizar");
                    }

                    if (vehiculo.uso.toLowerCase() === 'comercial') {
                        recargo += costoBase * 0.15; // Recargo 15% uso comercial
                    }

                    // --- Reglas Método de Pago ---
                    const tipoPagoLower = (metodoPago.tipo || '').toLowerCase().trim();
                    if (tipoPagoLower.includes('crédito') || tipoPagoLower.includes('credito')) {
                        descuento += costoBase * 0.05; // Descuento 5% crédito anual
                    }
                    if (tipoPagoLower.includes('cuota') || tipoPagoLower.includes('cuotas')) {
                        recargo += costoBase * 0.10; // Recargo 10% cuotas
                    }

                    // --- Cálculo Final ---
                    cotizacion.costo_base = parseFloat(costoBase.toFixed(2));
                    cotizacion.recargo = parseFloat(recargo.toFixed(2));
                    cotizacion.descuento = parseFloat(descuento.toFixed(2));
                    cotizacion.costo_final = parseFloat((costoBase + recargo - descuento).toFixed(2));

                    // --- Validación Final ---
                    if (rechazo.length > 0) {
                        cotizacion.estado = 'Rechazada';
                        cotizacion.motivo_rechazo = rechazo.join(" | ");
                    } else if (cotizacion.estado !== 'Aprobada') {
                        cotizacion.estado = 'Pendiente';
                        cotizacion.motivo_rechazo = null;
                    }

                    // Asegurar fecha de caducidad
                    if (!cotizacion.fecha_caducidad) {
                        const hoy = new Date();
                        cotizacion.fecha_caducidad = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
                    }

                    if (!cotizacion.fecha_emision) {
                        cotizacion.fecha_emision = new Date();
                    }
                } catch (error) {
                    throw new Error("Error en cálculo de cotización: " + error.message);
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
