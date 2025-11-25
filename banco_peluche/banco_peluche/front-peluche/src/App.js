import React from 'react';
import './App.css';
import ClientForm from './components/ClientForm';
import ClientList from './components/ClientList';
import ExportButtons from './components/ExportButtons';

function App() {
  return (
    <div className="container">
      <div className="topbar">
        <h1>Banco “Bandido de Peluche”</h1>
        <h2>Cálculo Financiero de un Cliente</h2>
      </div>
      <div className="grid">
        <ClientForm />
        <ClientList />
        <ExportButtons />
      </div>
    </div>
  );
}

export default App;
