import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import Cliente from '../models/Cliente.js';
import ResultadoCliente from '../models/ResultadoCliente.js';
import clienteService from '../services/cliente.service.js';

// Listar todos los resultados (y opcionalmente incluir cliente)
export const list = async (req, res) => {
  try {
    console.log('✓ GET /api/clientes - Intentando obtener resultados...');
    // obtener todos los resultados
    const resultadosRaw = await ResultadoCliente.findAll({
      order: [['createdAt', 'DESC']]
    });

    console.log(`✓ Se encontraron ${resultadosRaw.length} resultados`);

    // normalizar a objetos simples
    const resultados = resultadosRaw.map(r => (typeof r.toJSON === 'function' ? r.toJSON() : r));

    // obtener ids de clientes presentes en los resultados
    const clienteIds = [...new Set(resultados.map(r => r.clienteId).filter(Boolean))];

    // buscar clientes por ids y construir mapa id->nombre
    let clientesMap = {};
    if (clienteIds.length) {
      const clientes = await Cliente.findAll({
        where: { id: clienteIds }
      });
      clientesMap = clientes.reduce((m, c) => {
        m[c.id] = c.nombre;
        return m;
      }, {});
    }

    // enriquecer resultados: usar nombre del resultado si existe, sino nombre desde Cliente
    const enriched = resultados.map(r => ({
      ...r,
      nombre: (r.nombre && String(r.nombre).trim()) || clientesMap[r.clienteId] || ''
    }));

    console.log('✓ Devolviendo datos al frontend');
    res.json(enriched);
  } catch (err) {
    console.error('❌ Error listando resultados:', err);
    res.status(500).json({ message: 'Error listando resultados' });
  }
};

// Obtener por id
export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const resultado = await ResultadoCliente.findByPk(id);
    if (!resultado) return res.status(404).json({ message: 'Resultado no encontrado' });
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error obteniendo resultado' });
  }
};

// Crear cliente + calcular y guardar resultado
export const create = async (req, res) => {
  try {
    const { nombre } = req.body;

    // parsear valores numéricos y validar presencia
    const saldoAnterior = req.body.saldoAnterior !== undefined && req.body.saldoAnterior !== '' 
      ? Number(req.body.saldoAnterior) 
      : null;
    const montoCompras = req.body.montoCompras !== undefined && req.body.montoCompras !== '' 
      ? Number(req.body.montoCompras) 
      : null;
    const pagoRealizado = req.body.pagoRealizado !== undefined && req.body.pagoRealizado !== '' 
      ? Number(req.body.pagoRealizado) 
      : null;

    if (!nombre) return res.status(400).json({ message: 'Falta nombre' });
    if (saldoAnterior === null || montoCompras === null || pagoRealizado === null) {
      return res.status(400).json({ message: 'Faltan valores numéricos (saldoAnterior, montoCompras, pagoRealizado)' });
    }

    // Validar datos
    const validation = clienteService.validarDatos({ saldoAnterior, montoCompras, pagoRealizado });
    if (!validation.valid) {
      return res.status(400).json({ message: 'Validación fallida', errors: validation.errors });
    }

    // Crear cliente incluyendo los campos requeridos por el modelo
    const cliente = await Cliente.create({ nombre, saldoAnterior, montoCompras, pagoRealizado });

    // Calcular usando el servicio (ya con números)
    const resultadoCalc = clienteService.calcularCliente({
      saldoAnterior,
      montoCompras,
      pagoRealizado
    });

    const resultado = await ResultadoCliente.create({
      clienteId: cliente.id,
      nombre: nombre,
      saldoAnterior: resultadoCalc.saldoAnterior,
      montoCompras: resultadoCalc.montoCompras,
      pagoRealizado: resultadoCalc.pagoRealizado,
      saldoBase: resultadoCalc.saldoBase,
      pagoMinimoBase: resultadoCalc.pagoMinimoBase,
      esMoroso: resultadoCalc.esMoroso,
      interes: resultadoCalc.interes,
      multa: resultadoCalc.multa,
      saldoActual: resultadoCalc.saldoActual,
      pagoMinimo: resultadoCalc.pagoMinimo,
      pagoNoIntereses: resultadoCalc.pagoNoIntereses
    });

    res.status(201).json(resultado);
  } catch (err) {
    // Log completo en consola y devolver detalles para depuración
    console.error('Error en create cliente:', err);
    const payload = { message: err.message || 'Error guardando cliente' };
    if (err.errors && Array.isArray(err.errors)) {
      payload.details = err.errors.map(e => ({ path: e.path, message: e.message }));
    }
    // En desarrollo útil incluir stack (opcional)
    if (process.env.NODE_ENV !== 'production' && err.stack) payload.stack = err.stack;
    res.status(500).json(payload);
  }
};

// Exportar Excel (todos los resultados)
export const exportExcel = async (req, res) => {
  try {
    const resultados = await ResultadoCliente.findAll({ order: [['createdAt', 'DESC']] });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Resultados');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Saldo Anterior', key: 'saldoAnterior', width: 15 },
      { header: 'Compras', key: 'montoCompras', width: 15 },
      { header: 'Pago', key: 'pagoRealizado', width: 15 },
      { header: 'Moroso', key: 'esMoroso', width: 10 },
      { header: 'Interés', key: 'interes', width: 12 },
      { header: 'Multa', key: 'multa', width: 12 },
      { header: 'Saldo Actual', key: 'saldoActual', width: 15 },
      { header: 'Pago Mínimo', key: 'pagoMinimo', width: 15 },
      { header: 'Pago sin Intereses', key: 'pagoNoIntereses', width: 18 },
      { header: 'Creado', key: 'createdAt', width: 20 }
    ];

    resultados.forEach(r => {
      sheet.addRow({
        id: r.id,
        nombre: r.nombre ?? '',
        saldoAnterior: r.saldoAnterior,
        montoCompras: r.montoCompras,
        pagoRealizado: r.pagoRealizado,
        esMoroso: r.esMoroso ? 'Sí' : 'No',
        interes: r.interes,
        multa: r.multa,
        saldoActual: r.saldoActual,
        pagoMinimo: r.pagoMinimo,
        pagoNoIntereses: r.pagoNoIntereses,
        createdAt: r.createdAt
      });
    });

    res.setHeader('Content-Disposition', 'attachment; filename="resultados_clientes.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generando Excel' });
  }
};

// Exportar PDF (tabla simple)
export const exportPdf = async (req, res) => {
  try {
    const resultados = await ResultadoCliente.findAll({ order: [['createdAt', 'DESC']] });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Disposition', 'attachment; filename="resultados_clientes.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Resultados de Clientes', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    const startX = 30;
    let y = doc.y;
    const lineHeight = 16;

    // Encabezados
    doc.text('ID', startX, y);
    doc.text('Nombre', startX + 40, y);
    doc.text('Saldo Actual', startX + 260, y, { width: 80, align: 'right' });
    doc.text('Moroso', startX + 360, y, { width: 60, align: 'center' });
    y += lineHeight;

    resultados.forEach(r => {
      doc.text(String(r.id), startX, y);
      doc.text(String(r.nombre ?? ''), startX + 40, y, { width: 200 });
      doc.text(Number(r.saldoActual ?? 0).toFixed(2), startX + 260, y, { width: 80, align: 'right' });
      doc.text(r.esMoroso ? 'Sí' : 'No', startX + 360, y, { width: 60, align: 'center' });
      y += lineHeight;
      if (y > 750) { doc.addPage(); y = 40; }
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generando PDF' });
  }
};

// Actualizar cliente
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, saldoAnterior, montoCompras, pagoRealizado } = req.body;

    // Validar que existe el cliente
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    // Usar valores existentes o nuevos
    const newSaldoAnterior = saldoAnterior !== undefined ? Number(saldoAnterior) : Number(cliente.saldoAnterior);
    const newMontoCompras = montoCompras !== undefined ? Number(montoCompras) : Number(cliente.montoCompras);
    const newPagoRealizado = pagoRealizado !== undefined ? Number(pagoRealizado) : Number(cliente.pagoRealizado);

    // Validar datos
    const validation = clienteService.validarDatos({ 
      saldoAnterior: newSaldoAnterior, 
      montoCompras: newMontoCompras, 
      pagoRealizado: newPagoRealizado 
    });
    if (!validation.valid) {
      return res.status(400).json({ message: 'Validación fallida', errors: validation.errors });
    }

    // Actualizar datos del Cliente
    if (nombre !== undefined) cliente.nombre = nombre;
    if (saldoAnterior !== undefined) cliente.saldoAnterior = newSaldoAnterior;
    if (montoCompras !== undefined) cliente.montoCompras = newMontoCompras;
    if (pagoRealizado !== undefined) cliente.pagoRealizado = newPagoRealizado;

    await cliente.save();

    // Recalcular resultado
    const resultado = await ResultadoCliente.findOne({ where: { clienteId: id } });
    if (resultado) {
      const nuevosDatos = {
        saldoAnterior: cliente.saldoAnterior,
        montoCompras: cliente.montoCompras,
        pagoRealizado: cliente.pagoRealizado
      };

      const resultadoCalc = clienteService.actualizarCliente(cliente, nuevosDatos);

      // Actualizar resultado con nuevos cálculos
      resultado.nombre = nombre || resultado.nombre;
      resultado.saldoAnterior = resultadoCalc.saldoAnterior;
      resultado.montoCompras = resultadoCalc.montoCompras;
      resultado.pagoRealizado = resultadoCalc.pagoRealizado;
      resultado.saldoBase = resultadoCalc.saldoBase;
      resultado.pagoMinimoBase = resultadoCalc.pagoMinimoBase;
      resultado.esMoroso = resultadoCalc.esMoroso;
      resultado.interes = resultadoCalc.interes;
      resultado.multa = resultadoCalc.multa;
      resultado.saldoActual = resultadoCalc.saldoActual;
      resultado.pagoMinimo = resultadoCalc.pagoMinimo;
      resultado.pagoNoIntereses = resultadoCalc.pagoNoIntereses;

      await resultado.save();
      
      // Devolver el resultado como JSON plano
      const resultadoJSON = resultado.toJSON ? resultado.toJSON() : resultado;
      res.json({ message: 'Cliente actualizado', cliente, resultado: resultadoJSON });
    } else {
      res.json({ message: 'Cliente actualizado', cliente });
    }
  } catch (err) {
    console.error('Error actualizando cliente:', err);
    const payload = { message: err.message || 'Error actualizando cliente' };
    if (err.errors && Array.isArray(err.errors)) {
      payload.details = err.errors.map(e => ({ path: e.path, message: e.message }));
    }
    res.status(500).json(payload);
  }
};

// Eliminar cliente
export const delete_cliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    // Validar si se puede eliminar (lógica de negocio)
    if (!clienteService.puedeEliminarCliente(cliente)) {
      return res.status(400).json({ message: 'No se puede eliminar este cliente' });
    }

    // Eliminar resultado asociado (por CASCADE también se hace, pero explícito es mejor)
    await ResultadoCliente.destroy({ where: { clienteId: id } });

    // Eliminar cliente
    await cliente.destroy();

    res.json({ message: 'Cliente eliminado exitosamente', id });
  } catch (err) {
    console.error('Error eliminando cliente:', err);
    res.status(500).json({ message: 'Error eliminando cliente' });
  }
};

// Export default también por compatibilidad con imports default
export default { list, getById, create, update, delete: delete_cliente, exportExcel, exportPdf };
