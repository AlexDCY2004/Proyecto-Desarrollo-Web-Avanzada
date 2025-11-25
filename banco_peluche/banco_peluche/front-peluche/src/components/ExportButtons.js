import React from 'react';
import api from '../api/axiosInstance';

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function ExportButtons() {
  const getExcel = async () => {
    const res = await api.get('/clientes/export/excel', { responseType: 'blob' });
    downloadBlob(res.data, 'resultados_clientes.xlsx');
  };
  const getPdf = async () => {
    const res = await api.get('/clientes/export/pdf', { responseType: 'blob' });
    downloadBlob(res.data, 'resultados_clientes.pdf');
  };

  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={getExcel}>Descargar Excel</button>
      <button onClick={getPdf} style={{ marginLeft: 8 }}>Descargar PDF</button>
    </div>
  );
}