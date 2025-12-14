import React, { useEffect, useState } from 'react';

export default function ClientCharts({ results = [] }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!results || results.length === 0) return;

    const safeVal = (v) => Math.max(0, Number(v) || 0);

    // Calcular estadísticas
    const totalClientes = results.length;
    const morosidad = results.filter(r => r.esMoroso).length;
    const noMorosos = totalClientes - morosidad;
    const totalDeuda = results.reduce((sum, r) => sum + safeVal(r.saldoActual), 0);
    const deudaMorosos = results
      .filter(r => r.esMoroso)
      .reduce((sum, r) => sum + safeVal(r.saldoActual), 0);
    const deudaNormalCalc = Math.max(0, totalDeuda - deudaMorosos);

    setChartData({
      totalClientes,
      morosidad,
      noMorosos,
      totalDeuda,
      deudaMorosos,
      deudaNormal: deudaNormalCalc
    });
  }, [results]);

  if (!chartData) return null;

  const morosoPercent = ((chartData.morosidad / chartData.totalClientes) * 100).toFixed(1);
  const noMorososPercent = ((chartData.noMorosos / chartData.totalClientes) * 100).toFixed(1);
  const deudaMorososPercent = ((chartData.deudaMorosos / chartData.totalDeuda) * 100 || 0).toFixed(1);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 16,
      alignItems: 'stretch'
    }}>
      {/* Gráfico de pastel - Morosidad */}
      <div className="card" style={{ textAlign: 'center' }}>
        <h4>Distribución de Clientes</h4>
        <div style={{ position: 'relative', width: 200, height: 200, margin: '12px auto' }}>
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
            {/* Círculo morosos */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#b91c1c"
              strokeWidth="30"
              strokeDasharray={`${(chartData.morosidad / chartData.totalClientes) * 502.65} 502.65`}
            />
            {/* Círculo no morosos */}
            <circle
              cx="100"
              cy="100"
              r="65"
              fill="none"
              stroke="#16a34a"
              strokeWidth="30"
              strokeDasharray={`${(chartData.noMorosos / chartData.totalClientes) * 408.41} 408.41`}
              strokeDashoffset={`-${(chartData.morosidad / chartData.totalClientes) * 502.65}`}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>{chartData.totalClientes}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>Clientes</div>
          </div>
        </div>
        <div style={{ marginTop: 16, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              backgroundColor: '#b91c1c',
              borderRadius: '50%',
              marginRight: 8
            }} />
            <span style={{ color: '#0f172a', fontWeight: 500 }}>Morosos: {chartData.morosidad} ({morosoPercent}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 12,
              height: 12,
              backgroundColor: '#16a34a',
              borderRadius: '50%',
              marginRight: 8
            }} />
            <span style={{ color: '#0f172a', fontWeight: 500 }}>Al día: {chartData.noMorosos} ({noMorososPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Gráfico de barras - Deuda */}
      <div className="card" style={{ textAlign: 'center' }}>
        <h4>Deuda Total por Estado</h4>
        <div style={{ position: 'relative', height: 250, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '24px 12px 44px' }}>
          {/* Barra morosos */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              height: chartData.totalDeuda > 0 ? (chartData.deudaMorosos / chartData.totalDeuda) * 200 : 0,
              width: 60,
               backgroundColor: '#b91c1c',
               borderRadius: '4px 4px 0 0',
               transition: 'height 0.3s'
             }} />
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 'bold', color:'#0f172a' }}>Morosos</div>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>
              ${chartData.deudaMorosos.toFixed(2)}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>{deudaMorososPercent}%</div>
          </div>

          {/* Barra normales */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              height: chartData.totalDeuda > 0 ? (chartData.deudaNormal / chartData.totalDeuda) * 200 : 0,
              width: 60,
               backgroundColor: '#16a34a',
               borderRadius: '4px 4px 0 0',
               transition: 'height 0.3s'
             }} />
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 'bold', color:'#0f172a' }}>Al día</div>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>
              ${chartData.deudaNormal.toFixed(2)}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>{(100 - deudaMorososPercent).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Estadísticas resumidas */}
      <div className="card">
        <h4 style={{ color: '#1e3a8a' }}>Resumen Financiero</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{
            backgroundColor: '#f1f5f9',
            padding: 12,
            borderRadius: 6,
            borderLeft: '4px solid #2563eb'
          }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Deuda Total</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1e3a8a' }}>
              ${chartData.totalDeuda.toFixed(2)}
            </div>
          </div>

          <div style={{
            backgroundColor: '#fef2f2',
            padding: 12,
            borderRadius: 6,
            borderLeft: '4px solid #b91c1c'
          }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Deuda Morosos</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#b91c1c' }}>
              ${chartData.deudaMorosos.toFixed(2)}
            </div>
          </div>

          <div style={{
            backgroundColor: '#f0fdf4',
            padding: 12,
            borderRadius: 6,
            borderLeft: '4px solid #16a34a'
          }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Deuda Al Día</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#16a34a' }}>
              ${chartData.deudaNormal.toFixed(2)}
            </div>
          </div>

          <div style={{
            backgroundColor: '#fffbeb',
            padding: 12,
            borderRadius: 6,
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Tasa Morosidad</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#d97706' }}>
              {morosoPercent}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
