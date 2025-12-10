import React, { useState } from 'react';
import api from '../api/axiosInstance';

export default function ClientForm({ onSaved }) {
  const [nombre, setNombre] = useState('');
  const [saldoAnterior, setSaldoAnterior] = useState('');
  const [montoCompras, setMontoCompras] = useState('');
  const [pagoRealizado, setPagoRealizado] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!nombre || nombre.trim().length < 2) errs.nombre = 'Nombre requerido (mínimo 2 caracteres)';
    const sa = parseFloat(saldoAnterior);
    if (isNaN(sa) || sa < 0) errs.saldoAnterior = 'Saldo anterior debe ser un número >= 0';
    const mc = parseFloat(montoCompras);
    if (isNaN(mc) || mc < 0) errs.montoCompras = 'Monto de compras debe ser un número >= 0';
    const pr = parseFloat(pagoRealizado);
    if (isNaN(pr) || pr < 0) errs.pagoRealizado = 'Pago realizado debe ser un número >= 0';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    try {
      const payload = {
        nombre: nombre.trim(),
        // enviar como números
        saldoAnterior: Number(parseFloat(saldoAnterior || 0).toFixed(2)),
        montoCompras: Number(parseFloat(montoCompras || 0).toFixed(2)),
        pagoRealizado: Number(parseFloat(pagoRealizado || 0).toFixed(2)),
      };

      const { data } = await api.post('/clientes', payload);

      // Normalizar la respuesta: soportar varias formas de respuesta del backend
      let created = data;
      created = created?.data ?? created;
      created = created?.cliente ?? created;

      // Asegurar que nombre exista (usar el valor enviado si no viene en la respuesta)
      const normalized = { ...created, nombre: created?.nombre ?? payload.nombre };

      // limpiar formulario
      setNombre('');
      setSaldoAnterior('');
      setMontoCompras('');
      setPagoRealizado('');
      setFieldErrors({});

      if (onSaved) onSaved(normalized);
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data || err.response?.statusText || err.message;
      console.error('POST /clientes error:', err);
      setError(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
  };

  return (
    <div className="card">
      <h3 className="form-title">Ingresar Datos</h3>
      <form onSubmit={submit} noValidate>
        <label>Nombre del cliente:</label>
        <input
          className={fieldErrors.nombre ? 'input-error' : ''}
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
        {fieldErrors.nombre && <div className="error-message">{fieldErrors.nombre}</div>}

        <label>Saldo anterior:</label>
        <input
          type="number"
          step="0.01"
          className={fieldErrors.saldoAnterior ? 'input-error' : ''}
          value={saldoAnterior}
          onChange={e => setSaldoAnterior(e.target.value)}
          required
        />
        {fieldErrors.saldoAnterior && <div className="error-message">{fieldErrors.saldoAnterior}</div>}

        <label>Monto de compras:</label>
        <input
          type="number"
          step="0.01"
          className={fieldErrors.montoCompras ? 'input-error' : ''}
          value={montoCompras}
          onChange={e => setMontoCompras(e.target.value)}
          required
        />
        {fieldErrors.montoCompras && <div className="error-message">{fieldErrors.montoCompras}</div>}

        <label>Pago realizado:</label>
        <input
          type="number"
          step="0.01"
          className={fieldErrors.pagoRealizado ? 'input-error' : ''}
          value={pagoRealizado}
          onChange={e => setPagoRealizado(e.target.value)}
          required
        />
        {fieldErrors.pagoRealizado && <div className="error-message">{fieldErrors.pagoRealizado}</div>}

        <div style={{ marginTop: 12 }}>
          <button type="submit" className="btn-primary btn-large">Calcular Cliente</button>
        </div>

        {error && <div className="muted" style={{ marginTop: 10 }}>Error: {error}</div>}
      </form>
    </div>
  );
}