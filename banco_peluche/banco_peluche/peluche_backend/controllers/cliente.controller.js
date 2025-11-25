import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import Cliente from '../models/Cliente.js';
import ResultadoCliente from '../models/ResultadoCliente.js';
import clienteService from '../services/cliente.service.js';

// Listar todos los resultados (y opcionalmente incluir cliente)
export const list = async (req, res) => {
  try {
    const resultados = await ResultadoCliente.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(resultados);
  } catch (err) {
    console.error(err);
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

// Export default también por compatibilidad con imports default
export default { list, getById, create, exportExcel, exportPdf };
