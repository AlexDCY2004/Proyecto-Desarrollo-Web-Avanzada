//librerias necesarias
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { dbConnect, sequelize } from './src/config/database.js';

import usuarioRoute from './src/routes/usuarioRoute.js';
import conductorRoute from './src/routes/conductorRoute.js';
import vehiculoRoute from './src/routes/vehiculoRoute.js';
import metodoPagoRoute from './src/routes/metodoPagoRoute.js';
import cotizacionRoute from './src/routes/cotizacionRoute.js';



//inicializar la app
const app = express();
app.use(cors());
app.use(express.json());

// Log simple de peticiones (incluye body para ayudar a depurar PUT/POST)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    if (req.method !== 'GET') console.log('Body:', req.body);
    next();
});

//rutas
// Ruta raíz simple para evitar "Cannot GET /"
app.get('/', (req, res) => {
    res.send('API Backend Seguro Autos funcionando');
});


app.use('/api/usuarios', usuarioRoute);
app.use('/api/conductores', conductorRoute);
app.use('/api/vehiculos', vehiculoRoute);
app.use('/api/metodos-pago', metodoPagoRoute);
app.use('/api/cotizaciones', cotizacionRoute);



//conexion a la base de datos
dbConnect();
sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos sincronizada');
}).catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
});

//puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
