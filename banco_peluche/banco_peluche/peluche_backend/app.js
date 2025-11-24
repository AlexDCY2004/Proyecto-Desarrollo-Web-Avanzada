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

// Middleware
app.use(cors());
app.use(express.json());

// Rutas base
app.use('/api/clientes', clienteRoutes);

// Verificar la conexión a la base de datos
dbConnect(); 

// Sincronizar la base de datos (con alter para evitar perder datos existentes)
// Tras sync, asegurar que exista la FK con ON DELETE CASCADE
sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos sincronizada');
}).catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
});
// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Banco Bandido escuchando en http://localhost:${PORT}`);
});