import React from 'react';

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
            body { font-family: Arial, Helvetica, sans-serif; color:#012a56; padding:24px; }
            h1 { color: #0357a6; }
            table { width:100%; border-collapse: collapse; margin-top:12px; }
            th { text-align:left; padding:10px; border-bottom:2px solid #dfefff; color:#03396c; }
          </style>
        </head>
        <body>
          <h1>Resultados de Clientes</h1>
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

  const exportExcel = () => {
    // si existe código para excel, mantenlo o agrega aquí
    alert('Exportar Excel — función no implementada en este script.');
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="btn-primary" onClick={exportExcel}>Descargar Excel</button>
      <button className="btn-primary" onClick={exportPDF}>Descargar PDF</button>
    </div>
  );
}