import { useState, useEffect, useRef } from 'react';
import api from '../../services/api.service';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Message } from 'primereact/message';
import { Calendar } from 'primereact/calendar';

const GestionPolizas = () => {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [polizas, setPolizas] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);

    // Modal Crear Poliza
    const [showModal, setShowModal] = useState(false);
    const [selectedCotizacion, setSelectedCotizacion] = useState(null);
    const [fechaInicio, setFechaInicio] = useState(new Date());

    // Modal Detalle Cotizacion
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailCotizacion, setDetailCotizacion] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resCot, resPol] = await Promise.all([
                api.get('/cotizaciones'),
                api.get('/polizas')
            ]);
            setCotizaciones(resCot.data);
            setPolizas(resPol.data);
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar datos' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePoliza = async () => {
        if (!selectedCotizacion) return;
        try {
            await api.post('/polizas', {
                id_cotizacion: selectedCotizacion.id,
                fecha_inicio: fechaInicio
            });
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Póliza creada correctamente' });
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al crear la póliza.' });
        }
    };

    const handleAprobar = async (id) => {
        try {
            await api.patch(`/cotizaciones/${id}/estado`, { estado: 'Aprobada' });
            toast.current.show({ severity: 'success', summary: 'Aprobado', detail: 'Cotización aprobada' });
            setShowDetailModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al aprobar' });
        }
    };

    const handleRechazar = async (id) => {
        try {
            await api.patch(`/cotizaciones/${id}/estado`, { estado: 'Rechazada', motivo_rechazo: 'Rechazo administrativo manual' });
            toast.current.show({ severity: 'info', summary: 'Rechazado', detail: 'Cotización rechazada' });
            setShowDetailModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al rechazar' });
        }
    };

    const openCreateDialog = (cotizacion) => {
        setSelectedCotizacion(cotizacion);
        setFechaInicio(new Date());
        setShowModal(true);
    };

    const openDetailDialog = (cotizacion) => {
        setDetailCotizacion(cotizacion);
        setShowDetailModal(true);
    };

    // Templates
    const statusBodyTemplate = (rowData) => {
        let sev = 'info';
        if (rowData.estado === 'Aprobada') sev = 'success';
        if (rowData.estado === 'Rechazada') sev = 'danger';
        return <Tag value={rowData.estado} severity={sev} />;
    };

    const pendingActionsTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" severity="info" rounded onClick={() => openDetailDialog(rowData)} tooltip="Ver Detalle" />
        </div>
    );

    const approvedActionsTemplate = (rowData) => {
        const tienePoliza = polizas.some(p => p.id_cotizacion === rowData.id);
        if (tienePoliza) return <Tag value="CONVERTIDA EN POLIZA" icon="pi pi-check-circle" severity="success" />;
        return <Button label="Generar Póliza" icon="pi pi-file" size="small" onClick={() => openCreateDialog(rowData)} />;
    };

    const priceTemplate = (rowData) => `$${rowData.costo_final}`;

    // Filters
    const normalizeStatus = (s) => {
        if (s === true || s === 'true' || s === '1' || s === 1) return 'Aprobada';
        if (s === false || s === 'false' || s === '0' || s === 0) return 'Rechazada';
        return s; // 'Pendiente', 'Aprobada', 'Rechazada'
    };

    const pendientes = cotizaciones.filter(c => {
        const status = normalizeStatus(c.estado);
        return status === 'Pendiente';
    });

    const aprobadas = cotizaciones.filter(c => {
        const status = normalizeStatus(c.estado);
        return status === 'Aprobada';
    });

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <h2>Gestión de Pólizas y Cotizaciones</h2>

            <TabView>
                <TabPanel header="Cotizaciones Pendientes">
                    <p>Revise las cotizaciones nuevas y decida si aprobarlas o rechazarlas.</p>
                    <DataTable value={pendientes} loading={loading} paginator rows={5} emptyMessage="No hay cotizaciones pendientes">
                        <Column field="id" header="ID" sortable />
                        <Column field="fecha_emision" header="Fecha" sortable />
                        <Column field="Usuario.nombre" header="Cliente" sortable />
                        <Column field="costo_final" header="Monto" body={priceTemplate} sortable />
                        <Column field="motivo_rechazo" header="Alertas/Notas" />
                        <Column header="Decisión" body={pendingActionsTemplate} />
                    </DataTable>
                </TabPanel>

                <TabPanel header="Generar Pólizas (Aprobadas)">
                    <p>Cotizaciones aprobadas listas para convertirse en póliza.</p>
                    <DataTable value={aprobadas} loading={loading} paginator rows={5} emptyMessage="No hay cotizaciones aprobadas pendientes de póliza">
                        <Column field="id" header="ID" sortable />
                        <Column field="fecha_emision" header="Fecha" sortable />
                        <Column field="Usuario.nombre" header="Cliente" sortable />
                        <Column field="costo_final" header="Monto" body={priceTemplate} sortable />
                        <Column header="Acción" body={approvedActionsTemplate} />
                    </DataTable>
                </TabPanel>

                <TabPanel header="Pólizas Vigentes">
                    <DataTable value={polizas} loading={loading} paginator rows={5}>
                        <Column field="numero_poliza" header="No. Póliza" sortable />
                        <Column field="Cotizacion.Usuario.nombre" header="Cliente" sortable />
                        <Column field="fecha_inicio" header="Inicio" sortable />
                        <Column field="estado" header="Estado" body={(r) => <Tag value={r.estado} severity="success" />} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Modal Creación Poliza */}
            <Dialog header="Generar Póliza" visible={showModal} style={{ width: '400px' }} onHide={() => setShowModal(false)}>
                <div className="flex flex-column gap-3">
                    <p><strong>Cotización ID:</strong> {selectedCotizacion?.id}</p>
                    <p><strong>Monto:</strong> ${selectedCotizacion?.costo_final}</p>
                    <div className="field">
                        <label className="block mb-2">Fecha de Inicio de Vigencia</label>
                        <Calendar value={fechaInicio} onChange={(e) => setFechaInicio(e.value)} showIcon dateFormat="yy-mm-dd" />
                    </div>
                    <Button label="Confirmar y Crear" onClick={handleCreatePoliza} />
                </div>
            </Dialog>

            {/* Modal Detalle Cotizacion */}
            <Dialog header="Detalle de Cotización" visible={showDetailModal} style={{ width: '600px' }} onHide={() => setShowDetailModal(false)}>
                {detailCotizacion && (
                    <div className="flex flex-column gap-3">
                        <div className="grid">
                            <div className="col-6">
                                <h5>Cliente</h5>
                                <p><strong>Nombre:</strong> {detailCotizacion.Usuario?.nombre}</p>
                                <p><strong>Fecha Solicitud:</strong> {detailCotizacion.fecha_emision}</p>
                            </div>
                            <div className="col-6">
                                <h5>Conductor</h5>
                                <p><strong>Nombre:</strong> {detailCotizacion.Conductor?.nombre} {detailCotizacion.Conductor?.apellido}</p>
                                <p><strong>Edad:</strong> {detailCotizacion.Conductor?.edad} años</p>
                                <p><strong>Licencia:</strong> {detailCotizacion.Conductor?.tipo_licencia}</p>
                                <p><strong>Accidentes:</strong> {detailCotizacion.Conductor?.accidentes_cantidad}</p>
                            </div>
                            <div className="col-6">
                                <h5>Vehículo</h5>
                                <p><strong>Modelo:</strong> {detailCotizacion.Vehiculo?.modelo}</p>
                                <p><strong>Año:</strong> {detailCotizacion.Vehiculo?.anio}</p>
                                <p><strong>Precio:</strong> ${detailCotizacion.Vehiculo?.precio}</p>
                                <p><strong>Uso:</strong> {detailCotizacion.Vehiculo?.uso}</p>
                            </div>
                            <div className="col-6">
                                <h5>Pago</h5>
                                <p><strong>Método:</strong> {detailCotizacion.MetodoPago?.tipo}</p>
                                <p><strong>Estado:</strong> {detailCotizacion.MetodoPago?.estado_validacion}</p>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round">
                            <h5>Desglose Económico</h5>
                            <p><strong>Costo Base:</strong> ${detailCotizacion.costo_base}</p>
                            <p><strong>Recargos:</strong> ${detailCotizacion.recargo}</p>
                            <p><strong>Descuentos:</strong> ${detailCotizacion.descuento}</p>
                            <h4 className="text-primary mt-2">Total Final: ${detailCotizacion.costo_final}</h4>
                        </div>

                        {detailCotizacion.motivo_rechazo && (
                            <Message severity="warn" text={`Alertas del Sistema: ${detailCotizacion.motivo_rechazo}`} />
                        )}

                        <div className="flex justify-content-end gap-2 mt-4 border-top-1 surface-border pt-3">
                            <Button label="Rechazar" icon="pi pi-times" severity="danger" onClick={() => handleRechazar(detailCotizacion.id)} />
                            <Button label="Aprobar" icon="pi pi-check" severity="success" onClick={() => handleAprobar(detailCotizacion.id)} />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default GestionPolizas;
