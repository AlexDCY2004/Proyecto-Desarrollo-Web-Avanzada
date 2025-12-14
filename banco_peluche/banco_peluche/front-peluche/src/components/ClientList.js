import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';

export default function ClientList({ results = [], loading = false, perPage = 8, onEdit = null }) {
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

  const handleEdit = (cliente) => {
    if (onEdit) onEdit(cliente);
  };

  const handleDelete = (cliente) => {
    if (!window.confirm(`¿Eliminar a ${cliente.nombre}?`)) return;
    if (onEdit) onEdit(cliente);
  };

  return (
    <div className="card table-wrap">
      <h3>Resultado del Cálculo</h3>
      {loading ? (
        <div className="muted">Cargando...</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table id="resultadoTabla">
              <thead>
                <tr>
                  <th>Acciones</th>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Saldo Anterior</th>
                  <th>Compras</th>
                  <th>Pago</th>
                  <th>Saldo Base</th>
                  <th>Saldo Actual</th>
                  <th>Moroso</th>
                  <th>Interés</th>
                  <th>Multa</th>
                  <th>Pago Mínimo</th>
                  <th>Pago sin Intereses</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr><td colSpan="13" className="center muted">Sin datos aún...</td></tr>
                ) : pageData.map(c => (
                  <tr key={c.id} className={c.esMoroso ? 'row-moroso' : ''}>
                    <td className="center" style={{ whiteSpace: 'nowrap' }}>
                      <button 
                        style={{ 
                          marginRight: 4,
                          padding: '6px 8px',
                          fontSize: 12,
                          backgroundColor: '#0357a6',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleEdit(c)}
                        title="Editar"
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#024a8d'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#0357a6'}
                      >
                        ✏️
                      </button>
                      <button 
                        style={{ 
                          padding: '6px 8px',
                          fontSize: 12,
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleDelete(c)}
                        title="Eliminar"
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                      >
                        🗑️
                      </button>
                    </td>
                    <td className="center">{c.id}</td>
                    <td>{c.nombre ?? '-'}</td>
                    <td className="number">{Number(c.saldoAnterior ?? 0).toFixed(2)}</td>
                    <td className="number">{Number(c.montoCompras ?? 0).toFixed(2)}</td>
                    <td className="number">{Number(c.pagoRealizado ?? 0).toFixed(2)}</td>
                    <td className="number">{Number(c.saldoBase ?? 0).toFixed(2)}</td>
                    <td className="number">{Number(c.saldoActual ?? 0).toFixed(2)}</td>
                    <td className="center">{c.esMoroso ? 'Sí' : 'No'}</td>
                    <td className="number">{Number(c.interes ?? 0).toFixed(2)}</td>
                    <td className="number">{Number(c.multa ?? 0).toFixed(2)}</td>
                    <td className="number">{Number(c.pagoMinimo ?? 0).toFixed(2)}</td>
                    <td className="number">{Number(c.pagoNoIntereses ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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