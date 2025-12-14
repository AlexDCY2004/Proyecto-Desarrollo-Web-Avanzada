import React, { useState, useEffect } from 'react';
import { listarEstudiantes, crearEstudiante, actualizarEstudiante, eliminarEstudiante, buscarEstudiante } from '../services/estudianteService';
import Alert from '../components/Alert';
import ConfirmationModal from '../components/ConfirmationModal';

export default function EstudiantePage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alert, setAlert] = useState({ show: false });
  const [showModal, setShowModal] = useState(false);
  const [estudianteAEliminar, setEstudianteAEliminar] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [formulario, setFormulario] = useState({
    nombre: '',
    cedula: '',
    email: '',
    telefono: '',
    direccion: '',
    estado: 'activo'
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  const cargarEstudiantes = async () => {
    setCargando(true);
    try {
      const data = await listarEstudiantes();
      setEstudiantes(data);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) {
      cargarEstudiantes();
      return;
    }
    
    setCargando(true);
    try {
      const data = await buscarEstudiante(busqueda);
      setEstudiantes(data);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formulario.nombre || !formulario.cedula) {
      setAlert({ show: true, type: 'warning', message: 'Nombre y cédula son obligatorios' });
      return;
    }

    try {
      if (editando) {
        await actualizarEstudiante(editando, formulario);
        setAlert({ show: true, type: 'success', message: 'Estudiante actualizado correctamente' });
      } else {
        await crearEstudiante(formulario);
        setAlert({ show: true, type: 'success', message: 'Estudiante creado correctamente' });
      }
      
      setFormulario({ nombre: '', cedula: '', email: '', telefono: '', direccion: '', estado: 'activo' });
      setEditando(null);
      setShowFormulario(false);
      cargarEstudiantes();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  const handleEditar = (estudiante) => {
    setFormulario(estudiante);
    setEditando(estudiante.id);
    setShowFormulario(true);
  };

  const handleEliminar = (estudiante) => {
    setEstudianteAEliminar(estudiante);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarEstudiante(estudianteAEliminar.id);
      setAlert({ show: true, type: 'success', message: 'Estudiante eliminado correctamente' });
      setShowModal(false);
      cargarEstudiantes();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-people-fill me-2"></i>
            Gestión de Estudiantes
          </h2>
        </div>
        <div className="col text-end">
          <button 
            className="btn btn-primary me-2"
            onClick={() => {
              setShowFormulario(!showFormulario);
              if (showFormulario) {
                setFormulario({ nombre: '', cedula: '', email: '', telefono: '', direccion: '', estado: 'activo' });
                setEditando(null);
              }
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            {showFormulario ? 'Cerrar' : 'Nuevo Estudiante'}
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
            <h5 className="mb-0">{editando ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h5>
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
              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  value={formulario.direccion}
                  onChange={(e) => setFormulario({ ...formulario, direccion: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={formulario.estado}
                  onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
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
              placeholder="Buscar por nombre, cédula o ID..."
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
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay estudiantes registrados
                    </td>
                  </tr>
                ) : (
                  estudiantes.map((estudiante) => (
                    <tr key={estudiante.id}>
                      <td>{estudiante.id}</td>
                      <td>{estudiante.nombre}</td>
                      <td>{estudiante.cedula}</td>
                      <td>{estudiante.email || '-'}</td>
                      <td>{estudiante.telefono || '-'}</td>
                      <td>
                        <span className={`badge ${estudiante.estado === 'activo' ? 'bg-success' : 'bg-danger'}`}>
                          {estudiante.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEditar(estudiante)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleEliminar(estudiante)}
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
        title="Eliminar Estudiante"
        message={`¿Está seguro de que desea eliminar a ${estudianteAEliminar?.nombre}?`}
        onConfirm={confirmarEliminar}
        onCancel={() => setShowModal(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDanger={true}
      />
    </div>
  );
}
