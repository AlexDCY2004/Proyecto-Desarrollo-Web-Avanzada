import React, { useEffect, useState } from 'react';
import ClientList from '../components/ClientList';
import ExportButtons from '../components/ExportButtons';
import ClientModal from '../components/ClientModal';
import api from '../api/axiosInstance';

export default function Clients() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);

  const loadResults = async () => {
    try {
      setLoading(true);
      console.log('Intentando conectar a: http://localhost:3001/api/clientes');
      const { data } = await api.get('/clientes');
      console.log('Datos recibidos:', data);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      // Ordenar del más antiguo al más nuevo (por ID ascendente)
      const sorted = list.sort((a, b) => (a.id || 0) - (b.id || 0));
      setResults(sorted);
      console.log('Datos cargados exitosamente:', sorted);
    } catch (err) {
      console.error('Error cargando resultados:', err);
      console.error('URL intentada:', err.config?.url);
      console.error('Status:', err.response?.status);
      console.error('Error message:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadResults(); }, []);

  const openModal = (cliente = null) => {
    setClienteParaEditar(cliente);
    setModalOpen(true);
  };

  const handleSaved = (created) => {
    console.log('handleSaved recibió:', created);
    
    // El item puede venir como:
    // 1. resultado directo (desde update)
    // 2. { data: resultado } (desde create normalizado)
    // 3. { deleted: true, id } (desde delete)
    const item = created?.data ?? created;
    
    if (!item) {
      console.warn('handleSaved recibió item vacío:', created);
      return;
    }
    
    if (item.deleted) {
      console.log('Eliminando cliente:', item.id);
      setResults(prev => prev.filter(r => r.id !== item.id));
      return;
    }
    
    console.log('Actualizando cliente:', item.id, 'nombre:', item.nombre);
    
    // Actualizar: encontrar y reemplazar o agregar al inicio
    setResults(prev => {
      const exists = prev.some(r => r.id === item.id);
      if (exists) {
        // Reemplazar el item existente
        console.log('Item existe, reemplazando');
        return prev.map(r => r.id === item.id ? item : r);
      } else {
        // Agregar al inicio si es nuevo
        console.log('Item nuevo, agregando al inicio');
        return [item, ...prev];
      }
    });
  };

  return (
    <div className="card-group">
      <ClientList results={results} loading={loading} onEdit={openModal} />
      <div className="export-row-mobile" style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <ExportButtons results={results} />
        <button className="btn-primary" onClick={() => openModal()}>Buscar Cliente</button>
      </div>
      <ClientModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        clienteParaEditar={clienteParaEditar}
      />
    </div>
  );
}
