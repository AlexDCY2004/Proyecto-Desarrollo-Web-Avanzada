import React from 'react';
import api from '../api/axiosInstance';

function getName(item) {
  if (!item) return '-';
  return item.nombre ??
    item.name ??
    item.nombre_cliente ??
    item.nombreCliente ??
    item.cliente?.nombre ??
    item.data?.nombre ??
    (typeof item === 'string' ? item : '-');
}
function getBoolMoroso(item) {
  const v = item?.esMoroso ?? item?.moroso ?? item?.isMoroso ?? item?.moroso_flag;
  if (v === undefined || v === null) return false;
  if (typeof v === 'boolean') return v;
  return String(v).toLowerCase() === 'sí' || String(v).toLowerCase() === 'si' || String(v).toLowerCase() === 'true' || String(Number(v)) === '1';
}
function fmt(n) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ExportButtons({ results = [] }) {
  const exportPDF = () => {
    // Calcular estadísticas
    const totalClientes = results.length;
    const morosidad = results.filter(r => r.esMoroso).length;
    const noMorosos = totalClientes - morosidad;
    const totalDeuda = results.reduce((sum, r) => sum + (Number(r.saldoActual) || 0), 0);
    const deudaMorosos = results
      .filter(r => r.esMoroso)
      .reduce((sum, r) => sum + (Number(r.saldoActual) || 0), 0);
    const deudaNormal = totalDeuda - deudaMorosos;

    const morosoPercent = totalClientes > 0 ? ((morosidad / totalClientes) * 100).toFixed(1) : 0;
    const deudaMorososPercent = totalDeuda > 0 ? ((deudaMorosos / totalDeuda) * 100).toFixed(1) : 0;

    const rows = (results || []).map(r => {
      const nombre = getName(r);
      const saldo = r.saldoActual ?? r.saldo ?? r.saldoAnterior ?? 0;
      const interes = r.interes ?? r.interest ?? 0;
      const moroso = getBoolMoroso(r) ? 'Sí' : 'No';
      const multa = r.multa ?? 0;
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${nombre}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${fmt(saldo)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${moroso}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${fmt(interes)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${fmt(multa)}</td>
      </tr>`;
    }).join('\n');

    const html = `
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Clientes - Banco Peluche</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; color:#012a56; padding:24px; background: #f9f9f9; }
            h1 { color: #0357a6; margin-bottom: 8px; }
            h2 { color: #024a8d; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 2px solid #dfefff; padding-bottom: 8px; }
            table { width:100%; border-collapse: collapse; margin-top:12px; }
            th { text-align:left; padding:10px; border-bottom:2px solid #dfefff; color:#03396c; background: #f0f5fb; }
            .summary { display: flex; gap: 20px; margin: 24px 0; flex-wrap: wrap; }
            .stat-box { background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #0357a6; flex: 1; min-width: 200px; }
            .stat-box h3 { color: #666; font-size: 12px; margin-bottom: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #0357a6; }
            .stat-box.danger { border-left-color: #dc3545; }
            .stat-box.danger .stat-value { color: #dc3545; }
            .stat-box.success { border-left-color: #28a745; }
            .stat-box.success .stat-value { color: #28a745; }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body>
          <div>
            <h1>📊 Reporte de Clientes - Banco Bandido de Peluche</h1>
            <p style="color: #666; margin-bottom: 12px;">Generado: ${new Date().toLocaleString('es-ES')}</p>
          </div>

          <div class="summary">
            <div class="stat-box">
              <h3>Total de Clientes</h3>
              <div class="stat-value">${totalClientes}</div>
            </div>
            <div class="stat-box danger">
              <h3>Clientes Morosos</h3>
              <div class="stat-value">${morosidad} (${morosoPercent}%)</div>
            </div>
            <div class="stat-box success">
              <h3>Clientes Al Día</h3>
              <div class="stat-value">${noMorosos}</div>
            </div>
            <div class="stat-box">
              <h3>Deuda Total</h3>
              <div class="stat-value">$${totalDeuda.toFixed(2)}</div>
            </div>
          </div>

          <div style="background: white; padding: 16px; border-radius: 8px; margin-top: 12px;">
            <h2>Distribución de Deuda</h2>
            <div style="display: flex; gap: 20px; margin-top: 12px;">
              <div style="flex: 1;">
                <div style="background: #dc3545; color: white; padding: 12px; border-radius: 6px; text-align: center;">
                  <div style="font-weight: bold;">Deuda Morosos</div>
                  <div style="font-size: 20px; margin-top: 6px;">$${deudaMorosos.toFixed(2)}</div>
                  <div style="font-size: 14px;">${deudaMorososPercent}% del total</div>
                </div>
              </div>
              <div style="flex: 1;">
                <div style="background: #28a745; color: white; padding: 12px; border-radius: 6px; text-align: center;">
                  <div style="font-weight: bold;">Deuda Al Día</div>
                  <div style="font-size: 20px; margin-top: 6px;">$${deudaNormal.toFixed(2)}</div>
                  <div style="font-size: 14px;">${(100 - deudaMorososPercent).toFixed(1)}% del total</div>
                </div>
              </div>
            </div>
          </div>

          <h2>Detalle de Clientes</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th style="text-align:right">Saldo Actual</th>
                <th style="text-align:right">Moroso</th>
                <th style="text-align:right">Interés</th>
                <th style="text-align:right">Multa</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center;">
            <p>Banco "Bandido de Peluche" - Reporte Financiero</p>
            <p>${new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </body>
      </html>
    `;
    const w = window.open('', '_blank');
    if (!w) return alert('Permite ventanas emergentes para exportar PDF.');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const exportExcel = async () => {
    try {
      const response = await api.get('/clientes/export/excel', {
        responseType: 'blob'
      });
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resultados_clientes.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportando Excel:', err);
      alert('Error al descargar Excel');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="btn-primary" onClick={exportExcel}>Descargar Excel</button>
      <button className="btn-primary" onClick={exportPDF}>Descargar PDF</button>
    </div>
  );
}