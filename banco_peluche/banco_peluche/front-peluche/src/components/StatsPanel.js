// ...new file...
import React from 'react';

function toNum(v) {
  return Number(v ?? 0) || 0;
}
function isMoroso(item) {
  // soportar varias claves
  return item?.esMoroso === true || item?.moroso === true || String(item?.esMoroso).toLowerCase() === 'sí' || String(item?.esMoroso).toLowerCase() === 'si' || item?.esMoroso === 'true' || item?.moroso === 'true';
}

export default function StatsPanel({ results = [] }) {
  const total = results.length;
  const morososList = results.filter(isMoroso);
  const morosos = morososList.length;
  const morososPercent = total > 0 ? (morosos / total) * 100 : 0;

  const sumSaldos = results.reduce((s, r) => s + toNum(r.saldoActual ?? r.saldo ?? r.saldoAnterior), 0);
  const sumInteresMorosos = morososList.reduce((s, r) => s + toNum(r.interes ?? r.interest ?? 0), 0);
  const sumSaldoMorosos = morososList.reduce((s, r) => s + toNum(r.saldoActual ?? r.saldo ?? r.saldoAnterior), 0);

  const avgSaldoMorosos = morosos > 0 ? sumSaldoMorosos / morosos : 0;
  const avgInteresMorosos = morosos > 0 ? sumInteresMorosos / morosos : 0;

  const format = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportPDF = () => {
    const html = `
      <html>
        <head>
          <title>Estadísticas - Banco Peluche</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color:#012a56; }
            h2 { color:#0357a6; }
            table { width:100%; border-collapse: collapse; margin-top:12px; }
            td, th { padding:8px 10px; border-bottom:1px solid #e6edf3; text-align:left; }
          </style>
        </head>
        <body>
          <h2>Estadísticas - Banco “Bandido de Peluche”</h2>
          <table>
            <tr><th>Total Clientes</th><td>${total}</td></tr>
            <tr><th>Morosos (cantidad)</th><td>${morosos}</td></tr>
            <tr><th>% Morosos</th><td>${morososPercent.toFixed(2)}%</td></tr>
            <tr><th>Promedio saldo (morosos)</th><td>${format(avgSaldoMorosos)}</td></tr>
            <tr><th>Promedio interés (morosos)</th><td>${format(avgInteresMorosos)}</td></tr>
            <tr><th>Suma de saldos (todos)</th><td>${format(sumSaldos)}</td></tr>
          </table>
        </body>
      </html>
    `;
    const w = window.open('', '_blank');
    if (!w) return alert('Permite ventanas emergentes para exportar PDF.');
    w.document.write(html);
    w.document.close();
    w.focus();
    // dar tiempo a pintar y abrir diálogo de impresión
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="card stats-panel">
      <h3>Estadísticas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><strong>Total Clientes</strong><div>{total}</div></div>
        <div><strong>Morosos</strong><div>{morosos} ({morososPercent.toFixed(2)}%)</div></div>
        <div><strong>Promedio saldo (morosos)</strong><div>{format(avgSaldoMorosos)}</div></div>
        <div><strong>Promedio interés (morosos)</strong><div>{format(avgInteresMorosos)}</div></div>
        <div style={{ gridColumn: '1 / -1' }}><strong>Suma de saldos (todos)</strong><div>{format(sumSaldos)}</div></div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={exportPDF}>Exportar PDF</button>
      </div>
    </div>
  );
}
// ...new file...