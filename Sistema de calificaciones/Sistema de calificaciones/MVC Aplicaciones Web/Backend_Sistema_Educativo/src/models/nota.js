
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Estudiante } from "./estudiante.js";
import { Asignatura } from "./asignatura.js";
import { Docente } from "./docente.js";

export const Nota = sequelize.define(
    "Nota",
    {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        
        // RELACIONES
        estudianteId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        asignaturaId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        docenteId: { 
            type: DataTypes.INTEGER, 
            allowNull: true 
        },
        
        // NÚMERO DE PARCIAL (1, 2 o 3)
        parcial: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: { 
                min: 1, 
                max: 3,
                isInt: { msg: "El parcial debe ser 1, 2 o 3" }
            }
        },
        
        // LAS 4 EVALUACIONES DEL PARCIAL (cada una sobre 20 puntos)
        tarea: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate: { 
                min: 0, 
                max: 20,
                isDecimal: { msg: "La tarea debe ser un número entre 0 y 20" }
            }
        },
        informe: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate: { 
                min: 0, 
                max: 20,
                isDecimal: { msg: "El informe debe ser un número entre 0 y 20" }
            }
        },
        leccion: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate: { 
                min: 0, 
                max: 20,
                isDecimal: { msg: "La lección debe ser un número entre 0 y 20" }
            }
        },
        examen: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate: { 
                min: 0, 
                max: 20,
                isDecimal: { msg: "El examen debe ser un número entre 0 y 20" }
            }
        },
        
        // NOTA FINAL DEL PARCIAL (calculada automáticamente)
        // Fórmula: tarea*20% + informe*20% + leccion*20% + examen*40%
        notaFinal: { 
            type: DataTypes.FLOAT, 
            allowNull: true,
        },
        
        // ESTADO DEL PARCIAL
        estado: { 
            type: DataTypes.ENUM('aprobado', 'reprobado', 'pendiente'), 
            allowNull: false, 
            defaultValue: 'pendiente'
        },
        
        // DATOS ADICIONALES
        observaciones: { 
            type: DataTypes.TEXT, 
            allowNull: true 
        },
        fecha: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW 
        }
    },
    {
        tableName: "notas",
        timestamps: false,
        
        // HOOKS: Calcular automáticamente la nota final y estado antes de guardar
        hooks: {
            beforeCreate: (nota) => {
                // Calcular nota final del parcial
                nota.notaFinal = calcularNotaFinal(
                    nota.tarea, 
                    nota.informe, 
                    nota.leccion, 
                    nota.examen
                );
                
                // Determinar estado del parcial
                nota.estado = nota.notaFinal >= 14 ? 'aprobado' : 'reprobado';
            },
            beforeUpdate: (nota) => {
                // Solo recalcular si cambió alguna evaluación
                if (nota.changed('tarea') || nota.changed('informe') || 
                    nota.changed('leccion') || nota.changed('examen')) {
                    
                    nota.notaFinal = calcularNotaFinal(
                        nota.tarea, 
                        nota.informe, 
                        nota.leccion, 
                        nota.examen
                    );
                    
                    nota.estado = nota.notaFinal >= 14 ? 'aprobado' : 'reprobado';
                }
            }
        }
    }
);

// FUNCIÓN AUXILIAR: Calcular la nota final del parcial
function calcularNotaFinal(tarea, informe, leccion, examen) {
    const notaTarea = parseFloat(tarea) * 0.20;    // 20%
    const notaInforme = parseFloat(informe) * 0.20; // 20%
    const notaLeccion = parseFloat(leccion) * 0.20; // 20%
    const notaExamen = parseFloat(examen) * 0.40;   // 40%
    
    return parseFloat((notaTarea + notaInforme + notaLeccion + notaExamen).toFixed(2));
}

// RELACIONES
Estudiante.hasMany(Nota, { 
    foreignKey: "estudianteId", 
    onDelete: "CASCADE" 
});
Nota.belongsTo(Estudiante, { 
    foreignKey: "estudianteId" 
});

// Asociaciones requeridas por los includes del controlador
Asignatura.hasMany(Nota, { foreignKey: "asignaturaId", onDelete: "CASCADE" });
Nota.belongsTo(Asignatura, { foreignKey: "asignaturaId" });

// Opcional: asociaciones con Docente si se usa en filtros o includes
Docente.hasMany(Nota, { foreignKey: "docenteId", onDelete: "SET NULL" });
Nota.belongsTo(Docente, { foreignKey: "docenteId" });



