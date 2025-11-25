import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';

export default function ClientList() {
  const [lista, setLista] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get('/clientes');
      setLista(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div className="card table-wrap">
      <h3>Resultado del Cálculo</h3>
      <table id="resultadoTabla">
        <thead>
          <tr>
            <th>Nombre</th><th>Saldo Actual</th><th>Moroso</th><th>Interés</th><th>Multa</th>
          </tr>
        </thead>
        <tbody>
          {lista.map(c => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td className="number">{Number(c.saldoActual).toFixed(2)}</td>
              <td>{c.esMoroso ? 'Sí' : 'No'}</td>
              <td className="number">{Number(c.interes).toFixed(2)}</td>
              <td className="number">{Number(c.multa).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}