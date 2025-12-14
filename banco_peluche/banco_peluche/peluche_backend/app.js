import express from 'express';
import cors from 'cors';
import clienteRoutes from './routes/cliente.routes.js';
import { sequelize } from './config/database.js';
import { dbConnect } from './config/database.js';

// Importar modelos (no importan uno del otro)
import Cliente from './models/Cliente.js';
import ResultadoCliente from './models/ResultadoCliente.js';

// Aplicar asociaciones definidas dentro de los modelos
// pasar un objeto "models" para que cada modelo pueda referenciar al otro sin import circular
const models = { Cliente, ResultadoCliente };
if (typeof Cliente.associate === 'function') Cliente.associate(models);
if (typeof ResultadoCliente.associate === 'function') ResultadoCliente.associate(models);

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para loguear todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// monta rutas
app.use('/api/clientes', clienteRoutes);

// puerto desde .env o 3001 para evitar conflicto con frontend (3000)
const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=> console.log(`Server listening on port ${PORT}`));

// Verificar la conexión a la base de datos
dbConnect(); 

// Sincronizar la base de datos (con alter para evitar perder datos existentes)
// Tras sync, asegurar que exista la FK con ON DELETE CASCADE
sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos sincronizada');
}).catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
});