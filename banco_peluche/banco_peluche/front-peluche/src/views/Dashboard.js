import React from 'react';
import ClientCharts from '../components/ClientCharts';
import StatsPanel from '../components/StatsPanel';
import api from '../api/axiosInstance';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [results, setResults] = useState([]);
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

  useEffect(() => { loadResults(); }, []);

  return (
    <div className="card-group">
      <div className="card stats-panel-large">
        <ClientCharts results={results} />
      </div>
      <StatsPanel results={results} />
      {loading && <div className="muted">Cargando datos…</div>}
    </div>
  );
}
