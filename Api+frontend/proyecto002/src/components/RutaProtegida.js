import { Navigate } from 'react-router-dom';
import { estaAutenticado, obtenerUsuarioActual } from '../services/authService';

export default function RutaProtegida({ children, rolesPermitidos }) {
  const autenticado = estaAutenticado();
  const usuario = obtenerUsuarioActual();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}