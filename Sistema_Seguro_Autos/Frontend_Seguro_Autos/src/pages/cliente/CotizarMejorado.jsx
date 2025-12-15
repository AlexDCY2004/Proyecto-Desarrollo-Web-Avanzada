import { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Panel } from 'primereact/panel';
import { ProgressBar } from 'primereact/progressbar';
import { Badge } from 'primereact/badge';
import api from '../services/api.service';
import {
    validarConductor,
    validarVehiculo,
    validarMetodoPago,
    validarCotizacion,
    calcularRecargosYDescuentos,
    validarFormularioCotizacion
} from '../utils/validators';
import './Cotizar.css';

const Cotizar = () => {
    // ==================== ESTADO PRINCIPAL ====================
    const [paso, setPaso] = useState(1); // 1-Conductor, 2-Vehículo, 3-Pago, 4-Resumen
    
    const [conductor, setConductor] = useState({
        nombre: '',
        apellido: '',
        edad: null,
        tipo_licencia: '',
        telefono: '',
        accidentes_cantidad: 0
    });

    const [vehiculo, setVehiculo] = useState({
        modelo: '',
        anio: new Date().getFullYear(),
        color: '',
        tipo: '',
        uso: '',
        precio: null
    });

    const [pago, setPago] = useState({
        tipo: '',
        numero: ''
    });

    const [cotizacion, setCotizacion] = useState({
        acepta_terminos: false
    });

    const [errores, setErrores] = useState({});
    const [avisos, setAvisos] = useState({});
    const [detalles, setDetalles] = useState({});
    const [loading, setLoading] = useState(false);
    const [cotizacionGenerada, setCotizacionGenerada] = useState(null);
    const [mostrarResumen, setMostrarResumen] = useState(false);

    const toast = useRef(null);

    // ==================== OPCIONES DROPDOWNS ====================
    const tiposLicencia = [
        { label: 'Clase A - Motocicletas', value: 'A' },
        { label: 'Clase B - Automóviles', value: 'B' },
        { label: 'Clase C - Camiones', value: 'C' },
        { label: 'Clase D - Transporte', value: 'D' },
        { label: 'Clase E - Transporte especial', value: 'E' }
    ];

    const tiposVehiculo = [
        { label: 'Sedán', value: 'Sedán' },
        { label: 'SUV', value: 'SUV' },
        { label: 'Camioneta', value: 'Camioneta' },
        { label: 'Auto Compacto', value: 'Compacto' },
        { label: 'Auto', value: 'Auto' }
    ];

    const usosVehiculo = [
        { label: 'Personal', value: 'Personal' },
        { label: 'Comercial', value: 'Comercial' },
        { label: 'Particular', value: 'Particular' }
    ];

    const tiposPago = [
        { label: 'Tarjeta de Crédito', value: 'Tarjeta de Crédito' },
        { label: 'Tarjeta de Débito', value: 'Tarjeta de Débito' },
        { label: 'Efectivo', value: 'Efectivo' }
    ];

    // ==================== VALIDACIÓN Y NAVEGACIÓN ====================
    const validarPaso = (pasoActual) => {
        let errs = {};
        let avs = {};

        if (pasoActual === 1) {
            errs = validarConductor(conductor);
            // Extraer avisos de edad y accidentes
            avs.edad = errs.edadAviso;
            avs.accidentes = errs.accidentesAviso;
            delete errs.edadAviso;
            delete errs.accidentesAviso;
        } else if (pasoActual === 2) {
            errs = validarVehiculo(vehiculo);
            avs.tipo = errs.tipoAviso;
            avs.uso = errs.usoAviso;
            delete errs.tipoAviso;
            delete errs.usoAviso;
        } else if (pasoActual === 3) {
            errs = validarMetodoPago(pago);
            avs.pago = errs.pagoAviso;
            delete errs.pagoAviso;
        } else if (pasoActual === 4) {
            errs = validarCotizacion(cotizacion, conductor, vehiculo);
        }

        setErrores(errs);
        setAvisos(avs);

        return Object.keys(errs).length === 0;
    };

    const irAlPaso = (nuevoPaso) => {
        if (validarPaso(paso)) {
            setPaso(nuevoPaso);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.current?.show({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Por favor corrige los errores antes de continuar',
                life: 3000
            });
        }
    };

    // ==================== GENERAR COTIZACIÓN ====================
    const generarCotizacion = async () => {
        if (!validarPaso(4)) {
            toast.current?.show({
                severity: 'error',
                summary: 'Validación',
                detail: 'Debes aceptar los términos y condiciones',
                life: 3000
            });
            return;
        }

        setLoading(true);

        try {
            // Calcular recargos y descuentos
            const calc = calcularRecargosYDescuentos(conductor, vehiculo, pago);
            setDetalles(calc);

            const userData = JSON.parse(localStorage.getItem('usuario') || '{}');
            const costoBase = parseFloat(vehiculo.precio) || 0;
            const costoFinal = costoBase + calc.recargo_total - calc.descuento_total;

            const response = await api.post('/cotizaciones', {
                id_usuario: userData.id || 1,
                id_conductor: conductor.id || null,
                id_vehiculo: vehiculo.id || null,
                id_pago: pago.id || null,
                acepta_terminos: true
            });

            if (response.data.cotizacion) {
                setCotizacionGenerada({
                    ...response.data.cotizacion,
                    costo_base: costoBase,
                    recargo_total: calc.recargo_total,
                    descuento_total: calc.descuento_total,
                    costo_final: costoFinal,
                    detalles: calc
                });

                setMostrarResumen(true);

                if (response.data.cotizacion.estado === 'Rechazada') {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Cotización Rechazada',
                        detail: response.data.cotizacion.motivo_rechazo || 'No se puede generar la cotización',
                        life: 5000,
                        sticky: true
                    });
                } else {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Cotización Generada',
                        detail: 'Tu cotización ha sido procesada correctamente',
                        life: 3000
                    });
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.mensaje || 'Error al generar cotización',
                life: 4000
            });
        } finally {
            setLoading(false);
        }
    };

    // ==================== CÁLCULO EN TIEMPO REAL ====================
    const calcularRiesgo = () => {
        let riesgo = 'Bajo';
        let valor = 20;

        if (conductor.edad && conductor.edad < 18) {
            return { riesgo: 'Crítico', valor: 100, color: 'red' };
        }
        if (conductor.edad && conductor.edad > 75) {
            return { riesgo: 'Crítico', valor: 100, color: 'red' };
        }

        if (conductor.edad && (conductor.edad >= 18 && conductor.edad <= 24)) {
            valor += 20;
            riesgo = 'Alto';
        } else if (conductor.edad && conductor.edad > 65) {
            valor += 15;
            riesgo = 'Medio-Alto';
        }

        if (conductor.accidentes_cantidad > 3) {
            valor += 30;
            riesgo = 'Muy Alto';
        } else if (conductor.accidentes_cantidad > 0) {
            valor += conductor.accidentes_cantidad * 10;
            riesgo = 'Medio';
        } else if (conductor.accidentes_cantidad === 0) {
            valor = Math.max(10, valor - 10);
            riesgo = 'Bajo';
        }

        if (vehiculo.tipo === 'SUV' || vehiculo.tipo === 'Camioneta') {
            valor += 10;
        }

        if (vehiculo.uso === 'Comercial') {
            valor += 15;
        }

        const color = valor >= 70 ? 'red' : valor >= 50 ? 'orange' : 'green';

        return { riesgo, valor: Math.min(100, valor), color };
    };

    const riesgoActual = calcularRiesgo();

    // ==================== COMPONENTE DE PASO ====================
    const renderPaso = () => {
        switch (paso) {
            case 1:
                return renderPasoConductor();
            case 2:
                return renderPasoVehiculo();
            case 3:
                return renderPasoPago();
            case 4:
                return renderPasoResumen();
            default:
                return null;
        }
    };

    const renderPasoConductor = () => (
        <div className="grid">
            <div className="col-12">
                <h3>Sección 1: Datos del Conductor</h3>
            </div>

            {/* Advertencias críticas */}
            {conductor.edad && conductor.edad < 18 && (
                <div className="col-12">
                    <Message 
                        severity="error" 
                        icon="pi pi-exclamation-triangle"
                        text="⚠️ Conductor menor de 18 años. NO se puede generar cotización."
                        className="w-full"
                    />
                </div>
            )}

            {conductor.edad && conductor.edad > 75 && (
                <div className="col-12">
                    <Message 
                        severity="error" 
                        icon="pi pi-exclamation-triangle"
                        text="⚠️ Conductor mayor de 75 años. Rechazo automático."
                        className="w-full"
                    />
                </div>
            )}

            {avisos.edad && (
                <div className="col-12">
                    <Message 
                        severity="warn" 
                        icon="pi pi-info-circle"
                        text={avisos.edad}
                        className="w-full"
                    />
                </div>
            )}

            {avisos.accidentes && (
                <div className="col-12">
                    <Message 
                        severity={conductor.accidentes_cantidad === 0 ? 'success' : 'info'} 
                        icon={conductor.accidentes_cantidad === 0 ? 'pi pi-check' : 'pi pi-info-circle'}
                        text={avisos.accidentes}
                        className="w-full"
                    />
                </div>
            )}

            <div className="col-12 md:col-6">
                <div className="flex flex-column gap-2">
                    <label>Nombre *</label>
                    <InputText 
                        value={conductor.nombre}
                        onChange={(e) => setConductor({ ...conductor, nombre: e.target.value })}
                        placeholder="Ej: Juan"
                        className={errores.nombre ? 'ng-invalid' : ''}
                    />
                    {errores.nombre && <small className="text-red-500">{errores.nombre}</small>}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="flex flex-column gap-2">
                    <label>Apellido *</label>
                    <InputText 
                        value={conductor.apellido}
                        onChange={(e) => setConductor({ ...conductor, apellido: e.target.value })}
                        placeholder="Ej: Pérez"
                        className={errores.apellido ? 'ng-invalid' : ''}
                    />
                    {errores.apellido && <small className="text-red-500">{errores.apellido}</small>}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="flex flex-column gap-2">
                    <label>Edad *
                        <Badge 
                            value={conductor.edad ? `${conductor.edad} años` : ''} 
                            className="ml-2"
                            severity={
                                conductor.edad < 18 ? 'danger' : 
                                conductor.edad > 75 ? 'danger' :
                                conductor.edad >= 18 && conductor.edad <= 24 ? 'warning' :
                                conductor.edad > 65 ? 'warning' : 'success'
                            }
                        />
                    </label>
                    <InputNumber 
                        value={conductor.edad}
                        onValueChange={(e) => setConductor({ ...conductor, edad: e.value })}
                        min={18}
                        max={120}
                        placeholder="18-120"
                        className={errores.edad ? 'ng-invalid' : ''}
                    />
                    {errores.edad && <small className="text-red-500">{errores.edad}</small>}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="flex flex-column gap-2">
                    <label>Tipo de Licencia *</label>
                    <Dropdown 
                        options={tiposLicencia}
                        value={conductor.tipo_licencia}
                        onChange={(e) => setConductor({ ...conductor, tipo_licencia: e.value })}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona tipo"
                        className={errores.tipo_licencia ? 'ng-invalid' : ''}
                    />
                    {errores.tipo_licencia && <small className="text-red-500">{errores.tipo_licencia}</small>}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="flex flex-column gap-2">
                    <label>Teléfono (10 dígitos) *</label>
                    <InputText 
                        value={conductor.telefono}
                        onChange={(e) => setConductor({ ...conductor, telefono: e.target.value.replace(/\D/g, '') })}
                        placeholder="1234567890"
                        maxLength="10"
                        className={errores.telefono ? 'ng-invalid' : ''}
                    />
                    {errores.telefono && <small className="text-red-500">{errores.telefono}</small>}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="flex flex-column gap-2">
                    <label>Cantidad de Accidentes
                        <Badge 
                            value={conductor.accidentes_cantidad} 
                            className="ml-2"
                            severity={
                                conductor.accidentes_cantidad === 0 ? 'success' :
                                conductor.accidentes_cantidad <= 3 ? 'warning' : 'danger'
                            }
                        />
                    </label>
                    <InputNumber 
                        value={conductor.accidentes_cantidad}
                        onValueChange={(e) => setConductor({ ...conductor, accidentes_cantidad: e.value || 0 })}
                        min={0}
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="col-12">
                <Divider />
            </div>

            <div className="col-12">
                <h4>Evaluación de Riesgo</h4>
                <div className="flex align-items-center gap-3">
                    <span>Nivel de Riesgo:</span>
                    <Tag 
                        value={riesgoActual.riesgo} 
                        severity={
                            riesgoActual.color === 'red' ? 'danger' :
                            riesgoActual.color === 'orange' ? 'warning' : 'success'
                        }
                    />
                    <ProgressBar 
                        value={riesgoActual.valor} 
                        style={{ width: '200px' }}
                        className={`bg-${riesgoActual.color}-100`}
                    />
                </div>
            </div>

            <div className="col-12">
                <Button 
                    label="Siguiente" 
                    icon="pi pi-arrow-right"
                    onClick={() => irAlPaso(2)}
                    className="w-full"
                />
            </div>
        </div>
    );

    const renderPasoVehiculo = () => (
        <div className="grid">
            <div className="col-12">
                <h3>Sección 2: Datos del Vehículo</h3>
            </div>

            {/* Advertencia de antigüedad */}
            {vehiculo.anio && new Date().getFullYear() - vehiculo.anio > 20 && (
                <div className="col-12">
                    <Message 
                        severity="error" 
                        icon="pi pi-exclamation-triangle"
                        text={`⚠️ Vehículo con ${new Date().getFullYear() - vehiculo.anio} años. NO se puede cotizar.`}
                        className="w-full"
                    />
                </div>
            )}

            {avisos.tipo && (
                <div className="col-12">
                    <Message 
                        severity="warn" 
                        icon="pi pi-info-circle"
                        text={avisos.tipo}
                        className="w-full"
                    />
                </div>
            )}

            {avisos.uso && (
                <div className="col-12">
                    <Message 
                        severity="warn" 
                        icon="pi pi-info-circle"
                        text={avisos.uso}
                        className="w-full"
                    />
                </div>
            )}

            <div className="col-12 md:col-6">
                <div className="flex flex-column gap-2">
                    <label>Modelo *</label>
                    <InputText 
                        value={vehiculo.modelo}
                        onChange={(e) => setVehiculo({ ...vehiculo, modelo: e.target.value })}
                        placeholder="Ej: Civic"
                        className={errores.modelo ? 'ng-invalid' : ''}
                    />
                    {errores.modelo && <small className="text-red-500">{errores.modelo}</small>}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="flex flex-column gap-2">
                    <label>Año *
                        <Badge 
                            value={vehiculo.anio ? `${new Date().getFullYear() - vehiculo.anio} años` : ''} 
                            className="ml-2"
                            severity={
                                vehiculo.anio && new Date().getFullYear() - vehiculo.anio > 20 ? 'danger' :
                                vehiculo.anio && new Date().getFullYear() - vehiculo.anio > 15 ? 'warning' : 'success'
                            }
                        />
                    </label>
                    <InputNumber 
                        value={vehiculo.anio}
                        onValueChange={(e) => setVehiculo({ ...vehiculo, anio: e.value })}
                        min={1900}
                        max={new Date().getFullYear()}
                        className={errores.anio ? 'ng-invalid' : ''}
                    />
                    {errores.anio && <small className="text-red-500">{errores.anio}</small>}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="flex flex-column gap-2">
                    <label>Color *</label>
                    <InputText 
                        value={vehiculo.color}
                        onChange={(e) => setVehiculo({ ...vehiculo, color: e.target.value })}
                        placeholder="Ej: Blanco"
                        className={errores.color ? 'ng-invalid' : ''}
                    />
                    {errores.color && <small className="text-red-500">{errores.color}</small>}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="flex flex-column gap-2">
                    <label>Tipo de Vehículo *</label>
                    <Dropdown 
                        options={tiposVehiculo}
                        value={vehiculo.tipo}
                        onChange={(e) => setVehiculo({ ...vehiculo, tipo: e.value })}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona tipo"
                        className={errores.tipo ? 'ng-invalid' : ''}
                    />
                    {errores.tipo && <small className="text-red-500">{errores.tipo}</small>}
                </div>
            </div>

            <div className="col-12">
                <div className="flex flex-column gap-2">
                    <label>Uso del Vehículo *</label>
                    <Dropdown 
                        options={usosVehiculo}
                        value={vehiculo.uso}
                        onChange={(e) => setVehiculo({ ...vehiculo, uso: e.value })}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona uso"
                        className={errores.uso ? 'ng-invalid' : ''}
                    />
                    {errores.uso && <small className="text-red-500">{errores.uso}</small>}
                </div>
            </div>

            <div className="col-12">
                <div className="flex flex-column gap-2">
                    <label>Precio del Vehículo ($) *</label>
                    <InputNumber 
                        value={vehiculo.precio}
                        onValueChange={(e) => setVehiculo({ ...vehiculo, precio: e.value })}
                        min={0}
                        mode="currency"
                        currency="USD"
                        locale="es-ES"
                        placeholder="0.00"
                        className={errores.precio ? 'ng-invalid' : ''}
                    />
                    {errores.precio && <small className="text-red-500">{errores.precio}</small>}
                </div>
            </div>

            <div className="col-12">
                <Divider />
            </div>

            <div className="col-12 md:col-6">
                <Button 
                    label="Anterior" 
                    icon="pi pi-arrow-left"
                    onClick={() => setPaso(1)}
                    className="p-button-secondary w-full"
                />
            </div>

            <div className="col-12 md:col-6">
                <Button 
                    label="Siguiente" 
                    icon="pi pi-arrow-right"
                    onClick={() => irAlPaso(3)}
                    className="w-full"
                />
            </div>
        </div>
    );

    const renderPasoPago = () => (
        <div className="grid">
            <div className="col-12">
                <h3>Sección 3: Forma de Pago</h3>
            </div>

            {avisos.pago && (
                <div className="col-12">
                    <Message 
                        severity="success" 
                        icon="pi pi-check-circle"
                        text={avisos.pago}
                        className="w-full"
                    />
                </div>
            )}

            <div className="col-12">
                <div className="flex flex-column gap-2">
                    <label>Método de Pago *</label>
                    <Dropdown 
                        options={tiposPago}
                        value={pago.tipo}
                        onChange={(e) => setPago({ ...pago, tipo: e.value })}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona método"
                        className={errores.tipo ? 'ng-invalid' : ''}
                    />
                    {errores.tipo && <small className="text-red-500">{errores.tipo}</small>}
                </div>
            </div>

            {pago.tipo !== 'Efectivo' && (
                <div className="col-12">
                    <div className="flex flex-column gap-2">
                        <label>Número de Tarjeta *</label>
                        <InputText 
                            value={pago.numero}
                            onChange={(e) => setPago({ ...pago, numero: e.target.value.replace(/\D/g, '') })}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            className={errores.numero ? 'ng-invalid' : ''}
                        />
                        {errores.numero && <small className="text-red-500">{errores.numero}</small>}
                    </div>
                </div>
            )}

            <div className="col-12">
                <Divider />
            </div>

            <div className="col-12 md:col-6">
                <Button 
                    label="Anterior" 
                    icon="pi pi-arrow-left"
                    onClick={() => setPaso(2)}
                    className="p-button-secondary w-full"
                />
            </div>

            <div className="col-12 md:col-6">
                <Button 
                    label="Siguiente" 
                    icon="pi pi-arrow-right"
                    onClick={() => irAlPaso(4)}
                    className="w-full"
                />
            </div>
        </div>
    );

    const renderPasoResumen = () => (
        <div className="grid">
            <div className="col-12">
                <h3>Sección 4: Resumen y Generación de Cotización</h3>
            </div>

            <div className="col-12">
                <h5>Datos del Conductor</h5>
                <div className="grid">
                    <div className="col-6"><strong>Nombre:</strong> {conductor.nombre} {conductor.apellido}</div>
                    <div className="col-6"><strong>Edad:</strong> {conductor.edad} años</div>
                    <div className="col-6"><strong>Licencia:</strong> Clase {conductor.tipo_licencia}</div>
                    <div className="col-6"><strong>Teléfono:</strong> {conductor.telefono}</div>
                    <div className="col-6"><strong>Accidentes:</strong> {conductor.accidentes_cantidad}</div>
                </div>
            </div>

            <div className="col-12">
                <Divider />
                <h5>Datos del Vehículo</h5>
                <div className="grid">
                    <div className="col-6"><strong>Modelo:</strong> {vehiculo.modelo}</div>
                    <div className="col-6"><strong>Año:</strong> {vehiculo.anio}</div>
                    <div className="col-6"><strong>Color:</strong> {vehiculo.color}</div>
                    <div className="col-6"><strong>Tipo:</strong> {vehiculo.tipo}</div>
                    <div className="col-6"><strong>Uso:</strong> {vehiculo.uso}</div>
                    <div className="col-6"><strong>Precio:</strong> ${vehiculo.precio}</div>
                </div>
            </div>

            <div className="col-12">
                <Divider />
                <h5>Método de Pago</h5>
                <div className="grid">
                    <div className="col-6"><strong>Tipo:</strong> {pago.tipo}</div>
                    {pago.numero && <div className="col-6"><strong>Tarjeta:</strong> ****{pago.numero.slice(-4)}</div>}
                </div>
            </div>

            <div className="col-12">
                <Divider />
                <div className="flex align-items-center gap-2">
                    <Checkbox 
                        checked={cotizacion.acepta_terminos}
                        onChange={(e) => setCotizacion({ ...cotizacion, acepta_terminos: e.checked })}
                    />
                    <label>
                        Acepto los términos y condiciones de la cotización
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                </div>
                {errores.acepta_terminos && <small className="text-red-500 block mt-2">{errores.acepta_terminos}</small>}
            </div>

            <div className="col-12">
                <Divider />
            </div>

            <div className="col-12 md:col-6">
                <Button 
                    label="Anterior" 
                    icon="pi pi-arrow-left"
                    onClick={() => setPaso(3)}
                    className="p-button-secondary w-full"
                />
            </div>

            <div className="col-12 md:col-6">
                <Button 
                    label="Generar Cotización" 
                    icon="pi pi-check"
                    onClick={generarCotizacion}
                    loading={loading}
                    disabled={loading || !cotizacion.acepta_terminos}
                    className="p-button-success w-full"
                />
            </div>
        </div>
    );

    // ==================== DIÁLOGO DE RESUMEN ====================
    return (
        <div className="cotizar-container">
            <Toast ref={toast} />

            <Card className="mb-4">
                <div className="grid">
                    <div className="col-12">
                        <h2>Cotizador de Seguro Vehicular</h2>
                        <p className="text-500">Completa los siguientes pasos para obtener tu cotización</p>
                    </div>

                    <div className="col-12">
                        <div className="flex gap-2 mb-4">
                            <Tag 
                                value="1. Conductor" 
                                severity={paso === 1 ? 'info' : paso > 1 ? 'success' : 'secondary'}
                                style={{ cursor: 'pointer' }}
                                onClick={() => paso > 1 && setPaso(1)}
                            />
                            <Tag 
                                value="2. Vehículo" 
                                severity={paso === 2 ? 'info' : paso > 2 ? 'success' : 'secondary'}
                                style={{ cursor: 'pointer' }}
                                onClick={() => paso > 2 && setPaso(2)}
                            />
                            <Tag 
                                value="3. Pago" 
                                severity={paso === 3 ? 'info' : paso > 3 ? 'success' : 'secondary'}
                                style={{ cursor: 'pointer' }}
                                onClick={() => paso > 3 && setPaso(3)}
                            />
                            <Tag 
                                value="4. Resumen" 
                                severity={paso === 4 ? 'info' : 'secondary'}
                                style={{ cursor: 'pointer' }}
                                onClick={() => paso === 4}
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        {renderPaso()}
                    </div>
                </div>
            </Card>

            {/* Diálogo de Resultado */}
            <Dialog 
                header="Resultado de Cotización" 
                visible={mostrarResumen} 
                onHide={() => setMostrarResumen(false)}
                modal
                style={{ width: '90vw', maxWidth: '600px' }}
            >
                {cotizacionGenerada && (
                    <div>
                        <div className={`p-3 mb-3 text-center border-round ${
                            cotizacionGenerada.estado === 'Rechazada' ? 'bg-red-100' :
                            cotizacionGenerada.estado === 'Aprobada' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                            <h3 className="m-0">
                                {cotizacionGenerada.estado === 'Rechazada' ? '❌ COTIZACIÓN RECHAZADA' :
                                 cotizacionGenerada.estado === 'Aprobada' ? '✓ COTIZACIÓN APROBADA' : '⏳ COTIZACIÓN PENDIENTE'}
                            </h3>
                        </div>

                        {cotizacionGenerada.estado === 'Rechazada' && (
                            <Message 
                                severity="error" 
                                text={cotizacionGenerada.motivo_rechazo || 'No se puede generar la cotización'}
                                className="w-full mb-3"
                            />
                        )}

                        {cotizacionGenerada.estado !== 'Rechazada' && (
                            <div>
                                <Panel header="Detalles de Cálculo" className="mb-3">
                                    {cotizacionGenerada.detalles?.recargos.length > 0 && (
                                        <div className="mb-3">
                                            <h5>Recargos Aplicables:</h5>
                                            {cotizacionGenerada.detalles.recargos.map((r, idx) => (
                                                <div key={idx} className="flex justify-content-between mb-2">
                                                    <span>{r.descripcion}</span>
                                                    <strong className="text-red-500">+${r.monto}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {cotizacionGenerada.detalles?.descuentos.length > 0 && (
                                        <div className="mb-3">
                                            <h5>Descuentos Aplicables:</h5>
                                            {cotizacionGenerada.detalles.descuentos.map((d, idx) => (
                                                <div key={idx} className="flex justify-content-between mb-2">
                                                    <span>{d.descripcion}</span>
                                                    <strong className="text-green-500">-${d.monto}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Panel>

                                <Divider />

                                <div className="p-3 bg-primary-50 border-round">
                                    <div className="flex justify-content-between mb-3">
                                        <span>Costo Base:</span>
                                        <strong>${cotizacionGenerada.costo_base?.toFixed(2) || '0.00'}</strong>
                                    </div>
                                    <div className="flex justify-content-between mb-3 text-red-500">
                                        <span>Recargos:</span>
                                        <strong>+${cotizacionGenerada.detalles?.recargo_total?.toFixed(2) || '0.00'}</strong>
                                    </div>
                                    <div className="flex justify-content-between mb-3 text-green-500">
                                        <span>Descuentos:</span>
                                        <strong>-${cotizacionGenerada.detalles?.descuento_total?.toFixed(2) || '0.00'}</strong>
                                    </div>
                                    <Divider />
                                    <div className="flex justify-content-between" style={{ fontSize: '1.2em' }}>
                                        <strong>Costo Final Anual:</strong>
                                        <strong className="text-blue-600">${cotizacionGenerada.costo_final?.toFixed(2) || '0.00'}</strong>
                                    </div>
                                </div>

                                <div className="mt-3 text-center text-500 text-sm">
                                    <p>Vigencia: {new Date(cotizacionGenerada.fecha_caducidad).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}

                        <Button 
                            label="Cerrar" 
                            onClick={() => setMostrarResumen(false)}
                            className="w-full mt-3"
                        />
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default Cotizar;
