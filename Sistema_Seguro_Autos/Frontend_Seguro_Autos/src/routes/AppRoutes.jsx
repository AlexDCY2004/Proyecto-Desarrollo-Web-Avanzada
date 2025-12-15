import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Cotizar from '../pages/cliente/Cotizar';
import GestionPolizas from '../pages/admin/GestionPolizas';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            <Route path="/cotizar" element={
                <ProtectedRoute>
                    <Cotizar />
                </ProtectedRoute>
            } />

            <Route path="/polizas" element={
                <ProtectedRoute>
                    <GestionPolizas />
                </ProtectedRoute>
            } />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
