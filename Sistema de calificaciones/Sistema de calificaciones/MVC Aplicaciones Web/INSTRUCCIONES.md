# Sistema de Gestión Académica

## Descripción
Sistema web completo para la gestión académica con registro de estudiantes, docentes, asignaturas, cursos y notas. Incluye cálculo automático de promedios parciales y evaluación de desempeño estudiantil.

## Estructura del Proyecto

```
├── Backend_Sistema_Educativo/    # API REST con Express.js
│   ├── app.js                    # Punto de entrada
│   ├── package.json              # Dependencias
│   ├── .env                      # Variables de entorno
│   └── src/
│       ├── config/
│       │   └── database.js       # Configuración de BD
│       ├── models/               # Modelos Sequelize
│       ├── controllers/          # Lógica de negocio
│       ├── routes/               # Rutas API
│       └── middlewares/          # Middleware de auth
│
└── Front_Sistema_Educativo/      # App React
    ├── package.json
    ├── public/
    └── src/
        ├── components/           # Componentes reutilizables
        ├── pages/                # Páginas principales
        ├── services/             # Cliente HTTP y servicios
        └── App.js                # Punto de entrada
```

## Requisitos Previos

- Node.js v16+
- MySQL Server
- npm o yarn

## Instalación

### 1. Backend

```bash
cd Backend_Sistema_Educativo
npm install
```

**Configurar `.env`:**
```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña
DB_DIALECT=mysql
DB_NAME=notasfinales
PORT=3000
```

**Crear base de datos:**
```sql
CREATE DATABASE notasfinales;
```

**Iniciar servidor:**
```bash
npm start  # o node app.js
```

El backend estará disponible en `http://localhost:3000`

### 2. Frontend

```bash
cd Front_Sistema_Educativo
npm install
```

**Configurar variable de entorno (opcional, por defecto usa localhost:3000):**
```bash
# Crear archivo .env en el directorio raíz
REACT_APP_API_URL=http://localhost:3000
```

**Iniciar aplicación:**
```bash
npm start
```

La aplicación se abrirá en `http://localhost:3000` (navegador)

## Características Implementadas

### ✅ Autenticación
- Login/Logout de usuarios
- Tokens JWT (simulados)
- Rutas protegidas por rol
- Persistencia de sesión

### ✅ Gestión de Estudiantes
- Listar todos los estudiantes
- Buscar por cédula, nombre o ID
- Ver perfil detallado
- Crear/Registrar estudiante
- Editar información
- Cambiar estado (activo/inactivo)
- Eliminación lógica

### ✅ Gestión de Docentes
- Listar docentes
- Buscar por nombre, ID o área
- Crear nuevos docentes
- Editar información
- Asignar materias o cursos
- Eliminación lógica

### ✅ Registro de Notas
- Listar todas las notas
- Filtrar por:
  - Estudiante
  - Docente
  - Parcial
  - Asignatura
- Ordenamiento por:
  - Fecha más reciente
  - Mayor nota
  - Menor nota
- Crear nota (4 componentes):
  - Tarea (20%)
  - Informe (20%)
  - Lección (20%)
  - Examen (40%)
- Cálculo automático de nota final
- Editar notas
- Eliminación lógica

### ✅ Panel de Inicio
- Estadísticas generales
- Últimas actividades
- Notificaciones recientes

### ✅ Interfaz de Usuario
- Diseño responsive con Bootstrap 5
- Iconos con Bootstrap Icons
- Componentes reutilizables:
  - `Alert` - Alertas contextuales
  - `ConfirmationModal` - Confirmación de acciones
- Validaciones de formularios

## Lógica de Cálculo de Notas

### Estructura del Semestre
- **3 Parciales** (cada uno vale 14 puntos)
- **Total semestre**: 42 puntos máximo
- **Límite de reprobación**: Si P1 + P2 < 28, el estudiante reprueba automáticamente

### Cálculo por Parcial
Cada parcial se compone de 4 evaluaciones:

| Evaluación | Porcentaje | Puntaje |
|-----------|-----------|---------|
| Tarea 1   | 20%       | 0-20    |
| Informe   | 20%       | 0-20    |
| Lección   | 20%       | 0-20    |
| Examen    | 40%       | 0-20    |
| **Total** | **100%**  | **0-20**|

**Fórmula:** `(Tarea×0.2) + (Informe×0.2) + (Lección×0.2) + (Examen×0.4)`

### Estados Académicos
- **Aprobado parcial**: Nota ≥ 12
- **Reprobado parcial**: Nota < 12
- **Reprobado anticipado**: P1 + P2 < 28
- **Aprobado semestre**: Promedio final ≥ 12
- **Reprobado semestre**: Promedio final < 12

## Endpoints API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registrar usuario
- `GET /api/auth/perfil` - Obtener perfil (protegido)

### Estudiantes
- `GET /api/estudiantes` - Listar todos
- `GET /api/estudiantes/:id` - Obtener por ID
- `GET /api/estudiantes/buscar?busqueda=` - Buscar
- `POST /api/estudiantes` - Crear
- `PUT /api/estudiantes/:id` - Actualizar
- `DELETE /api/estudiantes/:id` - Eliminar

### Docentes
- `GET /api/docentes` - Listar todos
- `GET /api/docentes/:id` - Obtener por ID
- `GET /api/docentes/buscar?busqueda=` - Buscar
- `POST /api/docentes` - Crear
- `PUT /api/docentes/:id` - Actualizar
- `DELETE /api/docentes/:id` - Eliminar

### Notas
- `GET /api/notas` - Listar con filtros
- `GET /api/notas/:id` - Obtener por ID
- `POST /api/notas` - Crear
- `PUT /api/notas/:id` - Actualizar
- `DELETE /api/notas/:id` - Eliminar (lógico)

## Datos de Prueba

### Usuarios por defecto (agregar en BD):

```sql
INSERT INTO usuarios (username, password, email, rol, estado) VALUES
('admin', 'admin123', 'admin@escuela.com', 'admin', 'activo'),
('docente1', 'docente123', 'docente@escuela.com', 'docente', 'activo'),
('estudiante1', 'estudiante123', 'estudiante@escuela.com', 'estudiante', 'activo');
```

## Notas Importantes

1. **Seguridad**: En producción, usa bcrypt para hashear contraseñas y JWT real (no simulado)
2. **CORS**: Ya configurado para desarrollo, ajustar en producción
3. **Base de datos**: Las tablas se crean automáticamente con `sequelize.sync()`
4. **Eliminación lógica**: Los registros se marcan como inactivos, no se eliminan
5. **Validaciones**: Frontend y backend (implementar validaciones más robustas)

## Troubleshooting

**Error de conexión a BD:**
- Verificar credenciales en `.env`
- Asegurar que MySQL está corriendo
- Crear la base de datos manualmente si es necesario

**Error CORS:**
- Verificar que el backend está corriendo en puerto 3000
- Revisar variable `REACT_APP_API_URL` en frontend

**Rutas no funcionan:**
- Asegurar que React Router está correctamente configurado
- Verificar que los componentes están importados correctamente

## Stack Tecnológico

### Backend
- Express.js (Framework web)
- Sequelize (ORM)
- MySQL (Base de datos)
- CORS (Manejo de solicitudes)

### Frontend
- React 19
- React Router DOM 7
- Bootstrap 5 (UI)
- Bootstrap Icons (Iconos)
- Axios (Cliente HTTP)

## Licencia
MIT

## Autor
Sistema de Gestión Académica - 2024
