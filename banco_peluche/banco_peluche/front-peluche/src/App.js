import React, { useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Register from './views/Register';
import Clients from './views/Clients';
import Dashboard from './views/Dashboard';
import api from './api/axiosInstance';

function App() {
  const [results, setResults] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);
  const location = useLocation();

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

    // Si fue eliminado, remover de lista
    if (item.deleted) {
      setResults(prev => prev.filter(r => r.id !== item.id));
      return;
    }

    setLatest(item);
    setResults(prev => [item, ...prev.filter(r => r.id !== item.id)]);
  };

  const openModal = (cliente = null) => {
    setClienteParaEditar(cliente);
    setModalOpen(true);
  };

  return (
    <div className="app-root">
      <div className="brand-topbar">
        <div className="container brand-inner">
          <div className="brand-title">Banco de Peluche</div>
        </div>
      </div>
      <div className="bg-decor">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>

      <header className="hero">
        <div className="container hero-inner">
          <div className="container" style={{ padding: '0 20px' }}>
            <nav className="nav-tabs">
              <Link className={`tab ${location.pathname === '/' ? 'active' : ''}`} to="/">Registro</Link>
              <Link className={`tab ${location.pathname.startsWith('/clientes') ? 'active' : ''}`} to="/clientes">Ver y Buscar</Link>
              <Link className={`tab ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`} to="/dashboard">Estadísticas</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container" style={{ marginTop: 12 }}>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>

      {/* Vistas ahora separadas por rutas */}
    </div>
  );
}

export default App;
