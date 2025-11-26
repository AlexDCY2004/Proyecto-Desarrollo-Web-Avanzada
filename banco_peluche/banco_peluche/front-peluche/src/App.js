import React, { useEffect, useState } from 'react';
import './App.css';
import ClientForm from './components/ClientForm';
import ClientList from './components/ClientList';
import ExportButtons from './components/ExportButtons';
import StatsPanel from './components/StatsPanel';
import api from './api/axiosInstance';

function App() {
  const [results, setResults] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadResults = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/clientes');
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setResults(list);
    } catch (err) {
      console.error('Error cargando resultados', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);
  
  const handleSaved = (created) => {
    const item = created?.data ?? created;
    if (!item) return;
    setLatest(item);
    setResults(prev => [item, ...prev.filter(r => r.id !== item.id)]);
  };

  return (
    <div className="app-root">
      <div className="bg-decor">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>

      <header className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>Banco “Bandido de Peluche”</h1>
            <p className="subtitle">Cálculo Financiero de un Cliente</p>
          </div>
        </div>
      </header>

      <main className="container layout">
        <div className="left-col">
          <div className="card">
            <ClientForm onSaved={handleSaved} />
          </div>
        </div>

        <div className="right-col">
          <div className="card-group">
            {latest && (
              <div className="card" style={{ marginBottom: 12 }}>
                <h3>Resultado Individual (último)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div><strong>Nombre</strong><div>{latest.nombre ?? '-'}</div></div>
                  <div><strong>Moroso</strong><div>{latest.esMoroso ? 'Sí' : 'No'}</div></div>
                  <div><strong>Saldo Actual</strong><div>{Number(latest.saldoActual ?? 0).toFixed(2)}</div></div>
                  <div><strong>Interés</strong><div>{Number(latest.interes ?? 0).toFixed(2)}</div></div>
                  <div><strong>Multa</strong><div>{Number(latest.multa ?? 0).toFixed(2)}</div></div>
                  <div><strong>Pago sin Intereses</strong><div>{Number(latest.pagoNoIntereses ?? 0).toFixed(2)}</div></div>
                </div>
              </div>
            )}

            <ClientList results={results} loading={loading} />

            <div className="export-row-mobile" style={{ marginTop: 12 }}>
              <ExportButtons />
            </div>
          </div>
        </div>
      </main>

      {/* Estadísticas abajo, a todo el ancho */}
      <div className="container" style={{ marginTop: 18 }}>
        <StatsPanel results={results} />
      </div>
    </div>
  );
}

export default App;
