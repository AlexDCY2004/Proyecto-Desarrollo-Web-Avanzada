import React, { useState } from 'react';
import ClientForm from '../components/ClientForm';

export default function Register() {
  const [latest, setLatest] = useState(null);
  return (
    <div className="layout">
      <div className="left-col">
        <div className="card">
          <ClientForm onSaved={(item) => setLatest(item)} />
        </div>
      </div>
      <div className="right-col">
        <div className="card">
          <h3>Datos del Registro</h3>
          {!latest ? (
            <p className="muted">Completa y guarda el formulario para ver el resumen aquí.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><strong>Nombre</strong><div>{latest.nombre ?? '-'}</div></div>
              <div><strong>Moroso</strong><div>{latest.esMoroso ? 'Sí' : 'No'}</div></div>
              <div><strong>Saldo Actual</strong><div>{Number(latest.saldoActual ?? 0).toFixed(2)}</div></div>
              <div><strong>Interés</strong><div>{Number(latest.interes ?? 0).toFixed(2)}</div></div>
              <div><strong>Total a Pagar</strong><div>{Number((latest.saldoActual ?? 0) + (latest.interes ?? 0) + (latest.multa ?? 0)).toFixed(2)}</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
