import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';

export default function ClientList({ results = [], loading = false, perPage = 8 }) {
  const [lista, setLista] = useState([]);
  const [page, setPage] = useState(1);

  const total = results.length;
  const pages = Math.max(1, Math.ceil(total / perPage));

  const pageData = useMemo(() => {
    const start = (page - 1) * perPage;
    return results.slice(start, start + perPage);
  }, [results, page, perPage]);

  const prev = () => setPage(p => Math.max(1, p - 1));
  const next = () => setPage(p => Math.min(pages, p + 1));

  const load = async () => {
    try {
      const { data } = await api.get('/clientes');
      setLista(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(()=>{ load(); }, []);

  // reset page if results shrink
  if (page > pages) setPage(pages);

  return (
    <div className="card table-wrap">
      <h3>Resultado del Cálculo</h3>
      {loading ? (
        <div className="muted">Cargando...</div>
      ) : (
        <>
          <table id="resultadoTabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Saldo Actual</th>
                <th>Moroso</th>
                <th>Interés</th>
                <th>Multa</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan="5" className="center muted">Sin datos aún...</td></tr>
              ) : pageData.map(c => (
                <tr key={c.id} className={c.esMoroso ? 'row-moroso' : ''}>
                  <td>{c.nombre ?? '-'}</td>
                  <td className="number">{Number(c.saldoActual ?? 0).toFixed(2)}</td>
                  <td className="center">{c.esMoroso ? 'Sí' : 'No'}</td>
                  <td className="number">{Number(c.interes ?? 0).toFixed(2)}</td>
                  <td className="number">{Number(c.multa ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination" style={{ justifyContent: 'space-between', marginTop: 12 }}>
            <div>
              <button className="page-btn" onClick={prev} disabled={page === 1}>Anterior</button>
              <button className="page-btn" onClick={next} disabled={page === pages} style={{ marginLeft: 8 }}>Siguiente</button>
              <span className="page-info"> Página {page} de {pages} </span>
            </div>
            <div className="page-info">Mostrando {pageData.length} de {total}</div>
          </div>
        </>
      )}
    </div>
  );
}