import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api.service';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';

const Login = () => {
    const [nombre, setNombre] = useState('');
    const [contrasenia, setContrasenia] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/usuarios/login', { nombre, contrasenia });
            login(response.data.usuario);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="flex justify-content-center align-items-center min-h-screen surface-ground">
            <Card title="Sistema Seguro Autos" subTitle="Iniciar Sesión" className="w-full md:w-4 min-w-min">
                <form onSubmit={handleSubmit} className="flex flex-column gap-3">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="username">Usuario</label>
                        <InputText
                            id="username"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="password">Contraseña</label>
                        <Password
                            id="password"
                            value={contrasenia}
                            onChange={(e) => setContrasenia(e.target.value)}
                            feedback={false}
                            toggleMask
                            required
                        />
                    </div>

                    {error && <Message severity="error" text={error} className="w-full" />}

                    <Button label="Ingresar" icon="pi pi-user" type="submit" />
                </form>
            </Card>
        </div>
    );
};

export default Login;
