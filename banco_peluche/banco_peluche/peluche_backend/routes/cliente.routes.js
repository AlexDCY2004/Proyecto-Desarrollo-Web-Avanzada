import express from 'express';
import * as clienteNamed from '../controllers/cliente.controller.js';
import clienteDefault from '../controllers/cliente.controller.js';

const router = express.Router();

// elegir el objeto exportado (default si tiene funciones, si no usar named)
const controller = (clienteDefault && Object.keys(clienteDefault).length > 0) ? clienteDefault : clienteNamed;

const resolve = (...names) => {
  for (const n of names) {
    if (typeof controller[n] === 'function') return controller[n];
  }
  // fallback que responde 501 para detectar rápidamente qué falta
  return (req, res) => res.status(501).json({ message: `Handler no implementado: ${names.join(' | ')}` });
};

// Endpoints de export (antes de rutas con :id)
router.get('/export/excel', resolve('exportExcel', 'exportarExcel'));
router.get('/export/pdf', resolve('exportPdf', 'exportarPdf'));

// Rutas principales (agrego POST '/' para que axios.post('/clientes') funcione)
router.get('/', resolve('list', 'listar', 'getAll'));
router.post('/', resolve('create', 'createAndCalculate', 'crearCliente', 'calcular'));
router.post('/calcular', resolve('createAndCalculate', 'calcular'));
router.post('/crear', resolve('create', 'crearCliente'));
router.get('/:id', resolve('getById', 'findById', 'obtener'));
router.put('/:id', resolve('update', 'actualizar', 'updateCliente'));
router.delete('/:id', resolve('delete', 'delete_cliente', 'eliminar', 'deleteCliente'));

export default router;
