import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import RutaProtegida from './components/RutaProtegida';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas de Admin protegidas */}
        <Route path="/admin/*" element={
          <RutaProtegida rolesPermitidos={['admin']}>
            <AdminDashboard />
          </RutaProtegida>
        } />

        {/* Redirección por defecto al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;