import React, { useState } from 'react';
import api from '../api/axiosInstance';

export default function ClientForm({ onSaved }) {
  const [nombre, setNombre] = useState('');
  const [saldoAnterior, setSaldoAnterior] = useState('');
  const [montoCompras, setMontoCompras] = useState('');
  const [pagoRealizado, setPagoRealizado] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = { nombre, saldoAnterior, montoCompras, pagoRealizado };
      const { data } = await api.post('/clientes', payload);
      setNombre(''); setSaldoAnterior(''); setMontoCompras(''); setPagoRealizado('');
      if (onSaved) onSaved(data);
    } catch (err) {
      // Mostrar error detallado para depurar
      const serverMsg = err.response?.data || err.response?.statusText || err.message;
      console.error('POST /clientes error:', err);
      setError(JSON.stringify(serverMsg));
    }
  };

  return (
    <div className="card">
      <h3>Ingresar Datos</h3>
      <form onSubmit={submit}>
        <label>Nombre del cliente:</label>
        <input value={nombre} onChange={e=>setNombre(e.target.value)} required />
        <label>Saldo anterior:</label>
        <input type="number" step="0.01" value={saldoAnterior} onChange={e=>setSaldoAnterior(e.target.value)} required />
        <label>Monto de compras:</label>
        <input type="number" step="0.01" value={montoCompras} onChange={e=>setMontoCompras(e.target.value)} required />
        <label>Pago realizado:</label>
        <input type="number" step="0.01" value={pagoRealizado} onChange={e=>setPagoRealizado(e.target.value)} required />
        <button type="submit">Calcular Cliente</button>
        {error && <div className="muted">Error: {error}</div>}
      </form>
    </div>
  );
}