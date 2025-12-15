import { useAuth } from '../context/AuthContext';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="p-4">
            <h1>Bienvenido, {user?.nombre}</h1>
            <p>Panel de Control del Sistema de Seguros.</p>
            <div className="flex gap-2">
                <Button label="Nueva Cotización" icon="pi pi-plus" onClick={() => navigate('/cotizar')} />
                <Button label="Ver Pólizas" icon="pi pi-list" className="p-button-secondary" onClick={() => navigate('/polizas')} />
                <Button label="Cerrar Sesión" icon="pi pi-power-off" className="p-button-danger" onClick={handleLogout} />
            </div>
        </div>
    );
};

export default Dashboard;
