import React, { useState, useEffect } from 'react';
import { listarDocentes, crearDocente, actualizarDocente, eliminarDocente, buscarDocente } from '../services/docenteService';
import Alert from '../components/Alert';
import ConfirmationModal from '../components/ConfirmationModal';

export default function DocentePage() {
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alert, setAlert] = useState({ show: false });
  const [showModal, setShowModal] = useState(false);
  const [docenteAEliminar, setDocenteAEliminar] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [formulario, setFormulario] = useState({
    nombre: '',
    cedula: '',
    email: '',
    telefono: '',
    departamento: '',
    especialidad: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    cargarDocentes();
  }, []);

  const cargarDocentes = async () => {
    setCargando(true);
    try {
      const data = await listarDocentes();
      setDocentes(data);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) {
      cargarDocentes();
      return;
    }
    
    setCargando(true);
    try {
      const data = await buscarDocente(busqueda);
      setDocentes(data);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formulario.nombre || !formulario.cedula || !formulario.departamento) {
      setAlert({ show: true, type: 'warning', message: 'Nombre, cédula y departamento son obligatorios' });
      return;
    }

    try {
      if (editando) {
        await actualizarDocente(editando, formulario);
        setAlert({ show: true, type: 'success', message: 'Docente actualizado correctamente' });
      } else {
        await crearDocente(formulario);
        setAlert({ show: true, type: 'success', message: 'Docente creado correctamente' });
      }
      
      setFormulario({ nombre: '', cedula: '', email: '', telefono: '', departamento: '', especialidad: '' });
      setEditando(null);
      setShowFormulario(false);
      cargarDocentes();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  const handleEditar = (docente) => {
    setFormulario(docente);
    setEditando(docente.id);
    setShowFormulario(true);
  };

  const handleEliminar = (docente) => {
    setDocenteAEliminar(docente);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarDocente(docenteAEliminar.id);
      setAlert({ show: true, type: 'success', message: 'Docente eliminado correctamente' });
      setShowModal(false);
      cargarDocentes();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-person-fill-check me-2"></i>
            Gestión de Docentes
          </h2>
        </div>
        <div className="col text-end">
          <button 
            className="btn btn-primary me-2"
            onClick={() => {
              setShowFormulario(!showFormulario);
              if (showFormulario) {
                setFormulario({ nombre: '', cedula: '', email: '', telefono: '', departamento: '', especialidad: '' });
                setEditando(null);
              }
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            {showFormulario ? 'Cerrar' : 'Nuevo Docente'}
          </button>
        </div>
      </div>

      <Alert 
        show={alert.show} 
        message={alert.message} 
        type={alert.type}
        onClose={() => setAlert({ show: false })}
      />

      {showFormulario && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">{editando ? 'Editar Docente' : 'Nuevo Docente'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Cédula *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.cedula}
                    onChange={(e) => setFormulario({ ...formulario, cedula: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formulario.email}
                    onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.telefono}
                    onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Departamento *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.departamento}
                    onChange={(e) => setFormulario({ ...formulario, departamento: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Especialidad</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.especialidad}
                    onChange={(e) => setFormulario({ ...formulario, especialidad: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-lg me-2"></i>
                {editando ? 'Actualizar' : 'Crear'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleBuscar} className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, ID o área..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>
      </div>

      {cargando ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Email</th>
                  <th>Departamento</th>
                  <th>Especialidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docentes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay docentes registrados
                    </td>
                  </tr>
                ) : (
                  docentes.map((docente) => (
                    <tr key={docente.id}>
                      <td>{docente.id}</td>
                      <td>{docente.nombre}</td>
                      <td>{docente.cedula}</td>
                      <td>{docente.email || '-'}</td>
                      <td>{docente.departamento || '-'}</td>
                      <td>{docente.especialidad || '-'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEditar(docente)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleEliminar(docente)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        show={showModal}
        title="Eliminar Docente"
        message={`¿Está seguro de que desea eliminar a ${docenteAEliminar?.nombre}?`}
        onConfirm={confirmarEliminar}
        onCancel={() => setShowModal(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDanger={true}
      />
    </div>
  );
}
