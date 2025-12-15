import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api.service';
import { validarUsuario } from '../utils/validators';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const Login = () => {
    const [nombre, setNombre] = useState('');
    const [contrasenia, setContrasenia] = useState('');
    const [errores, setErrores] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useRef(null);

    const validarFormulario = () => {
        const errs = validarUsuario({ nombre, contrasenia });
        setErrores(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validarFormulario()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Por favor completa correctamente todos los campos',
                life: 3000
            });
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/usuarios/login', { nombre, contrasenia });
            
            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: response.data.mensaje || 'Login exitoso',
                life: 2000
            });

            login(response.data.usuario);
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);

        } catch (err) {
            const mensajeError = err.response?.data?.mensaje || 'Error al iniciar sesión';
            setError(mensajeError);
            
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: mensajeError,
                life: 4000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-content-center align-items-center min-h-screen surface-ground">
            <Toast ref={toast} />
            <Card title="Sistema Seguro Autos" subTitle="Iniciar Sesión" className="w-full md:w-4 min-w-min">
                <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                    
                    {error && (
                        <Message 
                            severity="error" 
                            text={error} 
                            className="w-full"
                            closable
                        />
                    )}

                    <div className="flex flex-column gap-2">
                        <label htmlFor="username">Usuario</label>
                        <InputText
                            id="username"
                            value={nombre}
                            onChange={(e) => {
                                setNombre(e.target.value);
                                if (errores.nombre) setErrores({ ...errores, nombre: '' });
                            }}
                            placeholder="Mínimo 3 caracteres (letras y números)"
                            className={errores.nombre ? 'ng-invalid ng-touched p-invalid' : ''}
                        />
                        {errores.nombre && (
                            <small className="text-red-500">{errores.nombre}</small>
                        )}
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="password">Contraseña</label>
                        <Password
                            id="password"
                            value={contrasenia}
                            onChange={(e) => {
                                setContrasenia(e.target.value);
                                if (errores.contrasenia) setErrores({ ...errores, contrasenia: '' });
                            }}
                            feedback={false}
                            toggleMask
                            placeholder="Mínimo 8 caracteres"
                            className={errores.contrasenia ? 'ng-invalid ng-touched p-invalid' : ''}
                        />
                        {errores.contrasenia && (
                            <small className="text-red-500">{errores.contrasenia}</small>
                        )}
                    </div>

                    <Button 
                        label="Iniciar Sesión" 
                        icon="pi pi-sign-in"
                        type="submit"
                        className="p-button-success"
                        loading={loading}
                        disabled={loading}
                    />
                </form>
            </Card>
        </div>
    );
};

export default Login;
