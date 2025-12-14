import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function ClientModal({ isOpen, onClose, onSaved, clienteParaEditar = null }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [modo, setModo] = useState('buscar'); // 'buscar' o 'editar'
  const [formData, setFormData] = useState({
    nombre: '',
    saldoAnterior: '',
    montoCompras: '',
    pagoRealizado: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Si se abre con cliente para editar, cambiar modo
  useEffect(() => {
    if (clienteParaEditar && isOpen) {
      setClienteSeleccionado(clienteParaEditar);
      setFormData({
        nombre: clienteParaEditar.nombre || '',
        saldoAnterior: clienteParaEditar.saldoAnterior || '',
        montoCompras: clienteParaEditar.montoCompras || '',
        pagoRealizado: clienteParaEditar.pagoRealizado || ''
      });
      setModo('editar');
    } else {
      setModo('buscar');
      setBusqueda('');
      setResultadosBusqueda([]);
      setClienteSeleccionado(null);
      setFormData({ nombre: '', saldoAnterior: '', montoCompras: '', pagoRealizado: '' });
    }
    setError('');
  }, [isOpen, clienteParaEditar]);

  const buscarClientes = async () => {
    if (!busqueda.trim()) {
      setResultadosBusqueda([]);
      return;
    }

    try {
      setCargandoBusqueda(true);
      const { data } = await api.get('/clientes');
      const lista = Array.isArray(data) ? data : (data?.data ?? []);

      // Buscar por ID o nombre
      const filtrados = lista.filter(c =>
        String(c.id).includes(busqueda.trim()) ||
        (c.nombre && c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      );

      setResultadosBusqueda(filtrados);
    } catch (err) {
      console.error('Error buscando:', err);
      setError('Error al buscar clientes');
    } finally {
      setCargandoBusqueda(false);
    }
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData({
      nombre: cliente.nombre || '',
      saldoAnterior: cliente.saldoAnterior || '',
      montoCompras: cliente.montoCompras || '',
      pagoRealizado: cliente.pagoRealizado || ''
    });
    setModo('editar');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validarFormulario = () => {
    const errs = [];
    
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      errs.push('Nombre requerido (mínimo 2 caracteres)');
    }
    
    const sa = parseFloat(formData.saldoAnterior);
    if (isNaN(sa) || sa < 0) {
      errs.push('Saldo anterior debe ser un número >= 0');
    }
    
    const mc = parseFloat(formData.montoCompras);
    if (isNaN(mc) || mc < 0) {
      errs.push('Monto de compras debe ser un número >= 0');
    }
    
    const pr = parseFloat(formData.pagoRealizado);
    if (isNaN(pr) || pr < 0) {
      errs.push('Pago realizado debe ser un número >= 0');
    }
    
    // Validar que pago no sea mayor que saldo anterior + compras
    if (!isNaN(sa) && !isNaN(mc) && !isNaN(pr)) {
      const deudaTotal = sa + mc;
      if (pr > deudaTotal) {
        errs.push(`Pago realizado (${pr.toFixed(2)}) no puede exceder la deuda total (${deudaTotal.toFixed(2)})`);
      }
    }
    
    return errs;
  };

  const guardarCliente = async () => {
    const validationErrors = validarFormulario();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('; '));
      return;
    }

    try {
      setGuardando(true);
      setError('');

      const datosEnvio = {
        nombre: formData.nombre,
        saldoAnterior: parseFloat(formData.saldoAnterior) || 0,
        montoCompras: parseFloat(formData.montoCompras) || 0,
        pagoRealizado: parseFloat(formData.pagoRealizado) || 0
      };

      const response = await api.put(`/clientes/${clienteSeleccionado.id}`, datosEnvio);
      
      // El backend devuelve { message, cliente, resultado }
      // Usamos resultado que tiene todos los datos calculados
      console.log('Response from PUT:', response.data);
      const clienteActualizado = response.data?.resultado || response.data?.data || response.data;
      // Asegurar que el nombre actualizado esté presente
      if (clienteActualizado) {
        clienteActualizado.nombre = formData.nombre || clienteActualizado.nombre || '';
      }
      
      console.log('clienteActualizado:', clienteActualizado);

      if (onSaved) {
        onSaved(clienteActualizado);
      }

      alert('Cliente actualizado exitosamente');
      onClose();
    } catch (err) {
      console.error('Error guardando:', err);
      let errorMsg = 'Error al guardar cliente';
      
      // Capturar mensajes de error del servidor
      if (err.response?.data) {
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorMsg = err.response.data.errors.join('; ');
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCliente = async () => {
    if (!window.confirm(`¿Está seguro de que desea eliminar al cliente ${clienteSeleccionado.nombre}?`)) {
      return;
    }

    try {
      setGuardando(true);
      setError('');
      await api.delete(`/clientes/${clienteSeleccionado.id}`);

      if (onSaved) {
        onSaved({ deleted: true, id: clienteSeleccionado.id });
      }

      alert('Cliente eliminado exitosamente');
      onClose();
    } catch (err) {
      console.error('Error eliminando:', err);
      let errorMsg = 'Error al eliminar cliente';
      
      if (err.response?.data) {
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorMsg = err.response.data.errors.join('; ');
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      
      setError(errorMsg);
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: 12
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        maxWidth: 500,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: '#0357a6' }}>{modo === 'buscar' ? '🔍 Buscar Cliente' : '✏️ Editar Cliente'}</h2>
          <button
            onClick={onClose}
            style={{
              background: '#e9ecef',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              width: 36,
              height: 36,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              color: '#6c757d'
            }}
            onMouseEnter={(e) => (e.target.style.background = '#dee2e6', e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.background = '#e9ecef', e.target.style.transform = 'scale(1)')}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: 12,
            borderRadius: 4,
            marginBottom: 12
          }}>
            {error}
          </div>
        )}

        {modo === 'buscar' ? (
          <div>
            <div style={{ marginBottom: 12 }}>
              <label>Buscar por ID o Nombre:</label>
              <input
                type="text"
                placeholder="Ej: 1 o Juan"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyUp={buscarClientes}
                style={{
                  width: '100%',
                  padding: 8,
                  marginTop: 4,
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
            </div>

            {cargandoBusqueda && <div className="muted">Buscando...</div>}

            {resultadosBusqueda.length > 0 && (
              <div>
                <p style={{ marginBottom: 8 }}>
                  <strong>Resultados ({resultadosBusqueda.length}):</strong>
                </p>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {resultadosBusqueda.map(cliente => (
                    <div
                      key={cliente.id}
                      onClick={() => seleccionarCliente(cliente)}
                      style={{
                        padding: 12,
                        border: '1px solid #eee',
                        borderRadius: 4,
                        marginBottom: 8,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        backgroundColor: '#f9f9f9'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                    >
                      <div><strong>ID:</strong> {cliente.id}</div>
                      <div><strong>Nombre:</strong> {cliente.nombre}</div>
                      <div><strong>Saldo Actual:</strong> ${Number(cliente.saldoActual || 0).toFixed(2)}</div>
                      <div><strong>Moroso:</strong> {cliente.esMoroso ? 'Sí' : 'No'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {busqueda && resultadosBusqueda.length === 0 && !cargandoBusqueda && (
              <div className="muted">No se encontraron resultados</div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 12 }}>
              <label><strong>ID:</strong> {clienteSeleccionado.id}</label>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: 8,
                  marginTop: 4,
                  border: !formData.nombre || formData.nombre.trim().length < 2 ? '2px solid #b91c1c' : '1px solid #ddd',
                  borderRadius: 4,
                  boxSizing: 'border-box',
                  backgroundColor: !formData.nombre || formData.nombre.trim().length < 2 ? '#fef2f2' : '#fff'
                }}
              />
              {(!formData.nombre || formData.nombre.trim().length < 2) && (
                <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 4 }}>Mínimo 2 caracteres</div>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Saldo Anterior</label>
              <input
                type="number"
                step="0.01"
                name="saldoAnterior"
                value={formData.saldoAnterior}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: 8,
                  marginTop: 4,
                  border: isNaN(parseFloat(formData.saldoAnterior)) || parseFloat(formData.saldoAnterior) < 0 ? '2px solid #b91c1c' : '1px solid #ddd',
                  borderRadius: 4,
                  boxSizing: 'border-box',
                  backgroundColor: isNaN(parseFloat(formData.saldoAnterior)) || parseFloat(formData.saldoAnterior) < 0 ? '#fef2f2' : '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Monto Compras</label>
              <input
                type="number"
                step="0.01"
                name="montoCompras"
                value={formData.montoCompras}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: 8,
                  marginTop: 4,
                  border: isNaN(parseFloat(formData.montoCompras)) || parseFloat(formData.montoCompras) < 0 ? '2px solid #b91c1c' : '1px solid #ddd',
                  borderRadius: 4,
                  boxSizing: 'border-box',
                  backgroundColor: isNaN(parseFloat(formData.montoCompras)) || parseFloat(formData.montoCompras) < 0 ? '#fef2f2' : '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Pago Realizado</label>
              <input
                type="number"
                step="0.01"
                name="pagoRealizado"
                value={formData.pagoRealizado}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: 8,
                  marginTop: 4,
                  border: isNaN(parseFloat(formData.pagoRealizado)) || parseFloat(formData.pagoRealizado) < 0 ? '2px solid #b91c1c' : '1px solid #ddd',
                  borderRadius: 4,
                  boxSizing: 'border-box',
                  backgroundColor: isNaN(parseFloat(formData.pagoRealizado)) || parseFloat(formData.pagoRealizado) < 0 ? '#fef2f2' : '#fff'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginTop: 24
            }}>
              <button
                onClick={guardarCliente}
                disabled={guardando}
                style={{
                  gridColumn: '1 / -1',
                  padding: 12,
                  backgroundColor: '#0357a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  opacity: guardando ? 0.6 : 1,
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => !guardando && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 16px rgba(3, 87, 166, 0.3)')}
                onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}
              >
                {guardando ? 'Guardando...' : '✓ Guardar Cambios'}
              </button>
              <button
                onClick={eliminarCliente}
                disabled={guardando}
                style={{
                  padding: 12,
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  opacity: guardando ? 0.6 : 1,
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => !guardando && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.3)')}
                onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}
              >
                {guardando ? 'Eliminando...' : '🗑️ Eliminar'}
              </button>
              <button
                onClick={() => setModo('buscar')}
                disabled={guardando}
                style={{
                  padding: 12,
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 16px rgba(108, 117, 125, 0.3)')}
                onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}
              >
                ← Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
