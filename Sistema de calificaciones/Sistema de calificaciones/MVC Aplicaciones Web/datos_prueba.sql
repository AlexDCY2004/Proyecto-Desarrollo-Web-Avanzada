-- Base de datos del Sistema de Gestión Académica
-- Script de datos de prueba

-- ===================================
-- USUARIOS (Autenticación)
-- ===================================
INSERT INTO usuarios (username, password, email, rol, estado) VALUES
('admin', 'admin123', 'admin@escuela.com', 'admin', 'activo'),
('docente_martinez', 'docente123', 'martinez@escuela.com', 'docente', 'activo'),
('docente_garcia', 'docente123', 'garcia@escuela.com', 'docente', 'activo'),
('estudiante_juan', 'estudiante123', 'juan.perez@escuela.com', 'estudiante', 'activo'),
('estudiante_maria', 'estudiante123', 'maria.lopez@escuela.com', 'estudiante', 'activo'),
('estudiante_carlos', 'estudiante123', 'carlos.silva@escuela.com', 'estudiante', 'activo');

-- ===================================
-- CURSOS
-- ===================================
INSERT INTO cursos (nombre, nivel, paralelo, capacidad) VALUES
('Primero Básico', '1', 'A', 30),
('Primero Básico', '1', 'B', 30),
('Segundo Básico', '2', 'A', 30),
('Tercero Básico', '3', 'A', 30);

-- ===================================
-- ASIGNATURAS
-- ===================================
INSERT INTO asignaturas (nombre, codigo, descripcion) VALUES
('Matemática', 'MAT001', 'Matemáticas básicas y cálculo'),
('Lenguaje', 'LEN001', 'Lengua española y literatura'),
('Ciencias', 'CIE001', 'Biología, química y física'),
('Historia', 'HIS001', 'Historia y ciencias sociales'),
('Educación Física', 'EDF001', 'Educación física y deportes');

-- ===================================
-- DOCENTES
-- ===================================
INSERT INTO docentes (nombre, cedula, email, telefono, direccion, fechaContratacion, especialidad, horasLaborales, departamento) VALUES
('Dr. Carlos Martínez', '123456789', 'martinez@escuela.com', '0987654321', 'Calle Principal 123', '2022-01-15', 'Matemáticas', 20, 'Ciencias'),
('Dra. María García', '987654321', 'garcia@escuela.com', '0987123456', 'Avenida Central 456', '2022-02-20', 'Lenguaje', 20, 'Humanidades'),
('Ing. Jorge López', '456789123', 'lopez@escuela.com', '0987456789', 'Calle Sur 789', '2022-03-10', 'Ciencias', 18, 'Ciencias'),
('Lic. Ana Silva', '789123456', 'silva@escuela.com', '0987789123', 'Avenida Norte 321', '2022-04-05', 'Historia', 20, 'Humanidades');

-- ===================================
-- ESTUDIANTES
-- ===================================
INSERT INTO estudiantes (nombre, cedula, email, telefono, direccion, fechaNacimiento, estado, cursoId) VALUES
('Juan Pérez González', '1023456789', 'juan.perez@escuela.com', '0998765432', 'Calle Flores 123', '2008-05-15', 'activo', 1),
('María López Rodríguez', '1023456790', 'maria.lopez@escuela.com', '0998765433', 'Calle Rosas 456', '2008-06-20', 'activo', 1),
('Carlos Silva Mendoza', '1023456791', 'carlos.silva@escuela.com', '0998765434', 'Calle Lirios 789', '2008-07-10', 'activo', 1),
('Ana García Torres', '1023456792', 'ana.garcia@escuela.com', '0998765435', 'Calle Girasoles 321', '2008-08-05', 'activo', 2),
('Luis Ramírez Castro', '1023456793', 'luis.ramirez@escuela.com', '0998765436', 'Calle Margaritas 654', '2008-09-12', 'activo', 2),
('Patricia Morales Díaz', '1023456794', 'patricia.morales@escuela.com', '0998765437', 'Calle Tulipanes 987', '2008-10-08', 'activo', 2);

-- ===================================
-- NOTAS - Parcial 1 (Ejemplo de Juan Pérez en Matemática)
-- ===================================
-- Parcial 1: Tarea=18, Informe=15, Lección=20, Examen=12
-- Cálculo: (18*0.2) + (15*0.2) + (20*0.2) + (12*0.4) = 3.6 + 3 + 4 + 4.8 = 15.4/20
INSERT INTO notas (estudianteId, asignaturaId, docenteId, parcial, tarea, informe, leccion, examen, notaFinal, observaciones, estado) VALUES
(1, 1, 1, 1, 18, 15, 20, 12, 15.4, 'Buen desempeño general', 'registrada'),
(1, 2, 2, 1, 16, 18, 19, 15, 16.4, 'Muy buen trabajo', 'registrada'),
(1, 3, 3, 1, 17, 14, 18, 13, 15.0, 'Desempeño satisfactorio', 'registrada'),
(2, 1, 1, 1, 20, 19, 20, 18, 19.2, 'Excelente estudiante', 'registrada'),
(2, 2, 2, 1, 19, 17, 20, 16, 18.2, 'Muy bueno', 'registrada'),
(3, 1, 1, 1, 15, 12, 14, 10, 12.4, 'Necesita mejorar en examen', 'registrada');

-- ===================================
-- NOTAS - Parcial 2
-- ===================================
INSERT INTO notas (estudianteId, asignaturaId, docenteId, parcial, tarea, informe, leccion, examen, notaFinal, observaciones, estado) VALUES
(1, 1, 1, 2, 19, 17, 19, 14, 16.6, 'Mejora en parcial 2', 'registrada'),
(1, 2, 2, 2, 18, 19, 20, 16, 18.2, 'Muy buen desempeño', 'registrada'),
(2, 1, 1, 2, 20, 20, 20, 19, 19.6, 'Excelente desempeño', 'registrada'),
(3, 1, 1, 2, 16, 14, 15, 12, 14.0, 'Mejora significativa', 'registrada');

-- ===================================
-- NOTAS - Parcial 3
-- ===================================
INSERT INTO notas (estudianteId, asignaturaId, docenteId, parcial, tarea, informe, leccion, examen, notaFinal, observaciones, estado) VALUES
(1, 1, 1, 3, 18, 16, 18, 15, 16.4, 'Cierre satisfactorio', 'registrada'),
(1, 2, 2, 3, 19, 18, 19, 17, 18.2, 'Excelente final', 'registrada'),
(2, 1, 1, 3, 20, 19, 20, 20, 19.8, 'Desempeño excepcional', 'registrada');

-- ===================================
-- ASIGNACIÓN DE CURSOS A ASIGNATURAS (ejemplo)
-- ===================================
-- Relación: Curso 1 (Primero A) toma: Matemática, Lenguaje, Ciencias
-- INSERT INTO curso_asignatura (cursoId, asignaturaId) VALUES
-- (1, 1), (1, 2), (1, 3),
-- (2, 1), (2, 2), (2, 3);
