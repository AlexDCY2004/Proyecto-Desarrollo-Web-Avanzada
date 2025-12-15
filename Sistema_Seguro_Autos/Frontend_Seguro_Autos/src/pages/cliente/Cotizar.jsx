import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api.service';
import { Steps } from 'primereact/steps';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';

import './Cotizar.css';

const Cotizar = () => {
    const { user } = useAuth();
    const [activeIndex, setActiveIndex] = useState(0);
    const toast = useRef(null);
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);

    // Form States
    const [conductor, setConductor] = useState({
        nombre: '', apellido: '', edad: 18, tipo_licencia: 'Tipo B', telefono: '', accidentes_cantidad: 0
    });
    const [vehiculo, setVehiculo] = useState({
        modelo: '', anio: 2024, color: '', tipo: 'Sedan', uso: 'Personal', precio: '0'
    });
    const [pago, setPago] = useState({
        tipo: 'Tarjeta de Crédito', estado_validacion: 'Aprobado'
    });

    // Options
    const tiposLicencia = [
        { label: 'Tipo A', value: 'Tipo A' },
        { label: 'Tipo B', value: 'Tipo B' },
        { label: 'Tipo C', value: 'Tipo C' }
    ];
    const tiposVehiculo = [
        { label: 'Sedan', value: 'Sedan' },
        { label: 'SUV', value: 'SUV' },
        { label: 'Camioneta', value: 'Camioneta' },
        { label: 'Deportivo', value: 'Deportivo' }
    ];
    const usosVehiculo = [
        { label: 'Personal', value: 'Personal' },
        { label: 'Comercial', value: 'Comercial' }
    ];
    const metodosPago = [
        { label: 'Tarjeta de Crédito', value: 'Tarjeta de Crédito' },
        { label: 'Tarjeta de Débito', value: 'Tarjeta de Débito' },
        { label: 'Cuotas', value: 'Cuotas' }
    ];

    const stepsItems = [
        { label: 'Conductor' },
        { label: 'Vehículo' },
        { label: 'Pago' },
        { label: 'Confirmar' }
    ];

    const validateConductor = () => {
        if (conductor.edad < 18) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'El conductor debe ser mayor de 18 años.' });
            return false;
        }
        if (conductor.edad > 75) {
            toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'La cotización podría ser rechazada por edad avanzada (>75).' });
        }
        return true;
    };

    const validateVehiculo = () => {
        const currentYear = new Date().getFullYear();
        if ((currentYear - vehiculo.anio) > 20) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Vehículos mayores a 20 años no son asegurables.' });
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (activeIndex === 0 && !validateConductor()) return;
        if (activeIndex === 1 && !validateVehiculo()) return;
        setActiveIndex(prev => prev + 1);
    };

    const handleBack = () => {
        setActiveIndex(prev => prev - 1);
    };

    const procesarCotizacion = async () => {
        setLoading(true);
        try {
            // 1. Crear Conductor
            const resConductor = await api.post('/conductores', { ...conductor, id_usuario: user.id });
            const idConductor = resConductor.data.id;

            // 2. Crear Vehiculo
            const resVehiculo = await api.post('/vehiculos', vehiculo);
            const idVehiculo = resVehiculo.data.id;

            // 3. Crear Metodo Pago
            const resPago = await api.post('/metodos-pago', pago);
            const idPago = resPago.data.id;

            // 4. Crear Cotizacion
            const payloadCotizacion = {
                id_usuario: user.id,
                id_conductor: idConductor,
                id_vehiculo: idVehiculo,
                id_pago: idPago,
                fecha_emision: new Date(),
                costo_base: 0, // Backend calcula
                costo_final: 0, // Backend calcula
                fecha_caducidad: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 dias
                estado: true // Backend recalcula esto
            };

            const resCotizacion = await api.post('/cotizaciones', payloadCotizacion);
            setResultado(resCotizacion.data);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cotización generada correctamente' });

        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al procesar la cotización' });
        } finally {
            setLoading(false);
        }
    };

    const renderConductor = () => (
        <div className="grid p-fluid">
            <div className="col-12 md:col-6 field">
                <label>Nombre</label>
                <InputText value={conductor.nombre} onChange={(e) => setConductor({ ...conductor, nombre: e.target.value })} />
            </div>
            <div className="col-12 md:col-6 field">
                <label>Apellido</label>
                <InputText value={conductor.apellido} onChange={(e) => setConductor({ ...conductor, apellido: e.target.value })} />
            </div>
            <div className="col-12 md:col-6 field">
                <label>Edad</label>
                <InputNumber value={conductor.edad} onValueChange={(e) => setConductor({ ...conductor, edad: e.value })} showButtons min={0} max={100} />
            </div>
            <div className="col-12 md:col-6 field">
                <label>Teléfono</label>
                <InputText value={conductor.telefono} onChange={(e) => setConductor({ ...conductor, telefono: e.target.value })} maxLength={10} />
            </div>
            <div className="col-12 md:col-6 field">
                <label>Licencia</label>
                <Dropdown value={conductor.tipo_licencia} options={tiposLicencia} onChange={(e) => setConductor({ ...conductor, tipo_licencia: e.value })} />
            </div>
            <div className="col-12 md:col-6 field">
                <label>Accidentes Previos</label>
                <InputNumber value={conductor.accidentes_cantidad} onValueChange={(e) => setConductor({ ...conductor, accidentes_cantidad: e.value })} showButtons min={0} />
            </div>
        </div>
    );

    const renderVehiculo = () => (
        <div className="grid p-fluid">
            <div className="col-12 md:col-6 field">
                <label>Modelo</label>
                <InputText value={vehiculo.modelo} onChange={(e) => setVehiculo({ ...vehiculo, modelo: e.target.value })} />
            </div>
            <div className="col-12 md:col-6 field">
                <label>Año</label>
                <InputNumber value={vehiculo.anio} onValueChange={(e) => setVehiculo({ ...vehiculo, anio: e.value })} useGrouping={false} />
            </div>
            <div className="col-12 md:col-6 field">
                <label>Color</label>
                <InputText value={vehiculo.color} onChange={(e) => setVehiculo({ ...vehiculo, color: e.target.value })} />
            </div>
            <div className="col-12 md:col-6 field">
                <label>Tipo</label>
                <Dropdown value={vehiculo.tipo} options={tiposVehiculo} onChange={(e) => setVehiculo({ ...vehiculo, tipo: e.value })} />
            </div>
            <div className="col-12 md:col-6 field">
                <label>Uso</label>
                <Dropdown value={vehiculo.uso} options={usosVehiculo} onChange={(e) => setVehiculo({ ...vehiculo, uso: e.value })} />
            </div>
            <div className="col-12 md:col-6 field">
                <label>Precio Estimado ($)</label>
                <InputNumber value={vehiculo.precio} onValueChange={(e) => setVehiculo({ ...vehiculo, precio: String(e.value) })} mode="currency" currency="USD" locale="en-US" />
            </div>
        </div>
    );

    const renderPago = () => (
        <div className="grid p-fluid">
            <div className="col-12 field">
                <label>Método de Pago</label>
                <Dropdown value={pago.tipo} options={metodosPago} onChange={(e) => setPago({ ...pago, tipo: e.value })} />
            </div>
            {/* Aqui podrian ir mas campos de tarjeta simulados */}
        </div>
    );

    const renderResultado = () => {
        if (!resultado) return (
            <div className="text-center">
                <h3>Resumen de la solicitud</h3>
                <p>Por favor confirma que todos los datos son correctos antes de enviar.</p>
                <Button label="GENERAR COTIZACIÓN" icon="pi pi-check" onClick={procesarCotizacion} loading={loading} />
            </div>
        );

        return (
            <div className="flex flex-column align-items-center gap-3">
                {resultado.estado === 'Aprobada' && <Message severity="success" text="Cotización Aprobada" />}
                {resultado.estado === 'Pendiente' && <Message severity="info" text="Solicitud Enviada - Pendiente de Aprobación" />}
                {resultado.estado === 'Rechazada' && <Message severity="error" text="Cotización Rechazada" />}

                <div className="w-full">
                    <ul className="list-none p-0 m-0">
                        <li className="flex justify-content-between p-2 border-bottom-1 surface-border">
                            <span>Costo Base:</span>
                            <span className="font-bold">${resultado.costo_base}</span>
                        </li>
                        <li className="flex justify-content-between p-2 border-bottom-1 surface-border">
                            <span>Recargos:</span>
                            <span className="text-red-500 font-bold">+${resultado.recargo}</span>
                        </li>
                        <li className="flex justify-content-between p-2 border-bottom-1 surface-border">
                            <span>Descuentos:</span>
                            <span className="text-green-500 font-bold">-${resultado.descuento}</span>
                        </li>
                        <li className="flex justify-content-between p-3 surface-100 mt-2">
                            <span className="text-xl">Total Final:</span>
                            <span className="text-xl font-bold">${resultado.costo_final}</span>
                        </li>
                    </ul>
                </div>

                {resultado.motivo_rechazo && (
                    <Message severity="warn" text={`Motivo: ${resultado.motivo_rechazo}`} />
                )}

                <Button label="Volver a Cotizar" onClick={() => window.location.reload()} text />
            </div>
        );
    };

    return (
        <div className="card-container p-4">
            <Toast ref={toast} />
            <div className="card">
                <Steps model={stepsItems} activeIndex={activeIndex} onSelect={(e) => setActiveIndex(e.index)} readOnly={true} className="mb-4" />

                <Card>
                    {activeIndex === 0 && renderConductor()}
                    {activeIndex === 1 && renderVehiculo()}
                    {activeIndex === 2 && renderPago()}
                    {activeIndex === 3 && renderResultado()}

                    {/* Navigation Buttons */}
                    {!resultado && (
                        <div className="flex justify-content-between mt-4">
                            <Button label="Atrás" icon="pi pi-angle-left" onClick={handleBack} disabled={activeIndex === 0} className="p-button-secondary" />
                            {activeIndex < 3 && (
                                <Button label="Siguiente" icon="pi pi-angle-right" iconPos="right" onClick={handleNext} />
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Cotizar;
