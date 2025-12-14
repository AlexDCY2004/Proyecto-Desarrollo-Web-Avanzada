import React, { useState, useEffect } from 'react';
import { listarNotas, crearNota, actualizarNota, eliminarNota } from '../services/notaService';
import { listarEstudiantes } from '../services/estudianteService';
import { listarDocentes } from '../services/docenteService';
import Alert from '../components/Alert';
import ConfirmationModal from '../components/ConfirmationModal';

export default function NotaPage() {
  const [notas, setNotas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alert, setAlert] = useState({ show: false });
  const [showModal, setShowModal] = useState(false);
  const [notaAEliminar, setNotaAEliminar] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);
  const [filtros, setFiltros] = useState({
    estudianteId: '',
    docenteId: '',
    parcial: '',
    ordenar: 'reciente'
  });
  const [formulario, setFormulario] = useState({
    estudianteId: '',
    docenteId: '',
    asignaturaId: '',
    parcial: 1,
    tarea: '',
    informe: '',
    leccion: '',
    examen: '',
    observaciones: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [notas, estudiantes, docentes] = await Promise.all([
        listarNotas(),
        listarEstudiantes(),
        listarDocentes()
      ]);
      setNotas(notas);
      setEstudiantes(estudiantes);
      setDocentes(docentes);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const cargarNotasConFiltros = async () => {
    setCargando(true);
    try {
      const notasFiltradas = await listarNotas(filtros);
      setNotas(notasFiltradas);
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formulario.estudianteId || !formulario.asignaturaId) {
      setAlert({ show: true, type: 'warning', message: 'Estudiante y asignatura son obligatorios' });
      return;
    }

    if (!formulario.tarea || !formulario.informe || !formulario.leccion || !formulario.examen) {
      setAlert({ show: true, type: 'warning', message: 'Todas las evaluaciones son requeridas' });
      return;
    }

    try {
      if (editando) {
        await actualizarNota(editando, formulario);
        setAlert({ show: true, type: 'success', message: 'Nota actualizada correctamente' });
      } else {
        await crearNota(formulario);
        setAlert({ show: true, type: 'success', message: 'Nota creada correctamente' });
      }
      
      resetearFormulario();
      cargarDatos();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  const resetearFormulario = () => {
    setFormulario({
      estudianteId: '',
      docenteId: '',
      asignaturaId: '',
      parcial: 1,
      tarea: '',
      informe: '',
      leccion: '',
      examen: '',
      observaciones: ''
    });
    setEditando(null);
    setShowFormulario(false);
  };

  const handleEditar = (nota) => {
    setFormulario(nota);
    setEditando(nota.id);
    setShowFormulario(true);
  };

  const handleEliminar = (nota) => {
    setNotaAEliminar(nota);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarNota(notaAEliminar.id);
      setAlert({ show: true, type: 'success', message: 'Nota eliminada correctamente' });
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      setAlert({ show: true, type: 'danger', message: error.message });
    }
  };

  // Calcular nota final
  const calcularNotaFinal = (tarea, informe, leccion, examen) => {
    if (!tarea || !informe || !leccion || !examen) return 0;
    return (
      parseFloat(tarea) * 0.2 +
      parseFloat(informe) * 0.2 +
      parseFloat(leccion) * 0.2 +
      parseFloat(examen) * 0.4
    ).toFixed(2);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-file-earmark-text-fill me-2"></i>
            Registro de Notas
          </h2>
        </div>
        <div className="col text-end">
          <button 
            className="btn btn-primary me-2"
            onClick={() => {
              if (showFormulario) resetearFormulario();
              else setShowFormulario(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            {showFormulario ? 'Cerrar' : 'Nueva Nota'}
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
            <h5 className="mb-0">{editando ? 'Editar Nota' : 'Nueva Nota'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Estudiante *</label>
                  <select
                    className="form-select"
                    value={formulario.estudianteId}
                    onChange={(e) => setFormulario({ ...formulario, estudianteId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar estudiante</option>
                    {estudiantes.map(est => (
                      <option key={est.id} value={est.id}>
                        {est.nombre} ({est.cedula})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Parcial *</label>
                  <select
                    className="form-select"
                    value={formulario.parcial}
                    onChange={(e) => setFormulario({ ...formulario, parcial: e.target.value })}
                    required
                  >
                    <option value={1}>Parcial 1</option>
                    <option value={2}>Parcial 2</option>
                    <option value={3}>Parcial 3</option>
                  </select>
                </div>
              </div>

              <div className="alert alert-info">
                <p className="mb-2"><strong>Instrucciones de evaluación:</strong></p>
                <p className="mb-0">Ingrese las 4 notas (de 0 a 20). La nota final se calculará automáticamente:</p>
                <ul className="mb-0 mt-2">
                  <li>Tarea: 20%</li>
                  <li>Informe: 20%</li>
                  <li>Lección: 20%</li>
                  <li>Examen: 40%</li>
                </ul>
              </div>

              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Tarea (0-20) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formulario.tarea}
                    onChange={(e) => setFormulario({ ...formulario, tarea: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Informe (0-20) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formulario.informe}
                    onChange={(e) => setFormulario({ ...formulario, informe: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Lección (0-20) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formulario.leccion}
                    onChange={(e) => setFormulario({ ...formulario, leccion: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Examen (0-20) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formulario.examen}
                    onChange={(e) => setFormulario({ ...formulario, examen: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">Nota Final (Calculada): <strong>{calcularNotaFinal(formulario.tarea, formulario.informe, formulario.leccion, formulario.examen)}/20</strong></label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formulario.observaciones}
                  onChange={(e) => setFormulario({ ...formulario, observaciones: e.target.value })}
                ></textarea>
              </div>
              
              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-lg me-2"></i>
                {editando ? 'Actualizar' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">Filtros</h5>
        </div>
        <div className="card-body">
          <form onSubmit={(e) => { e.preventDefault(); cargarNotasConFiltros(); }}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label">Estudiante</label>
                <select
                  className="form-select"
                  value={filtros.estudianteId}
                  onChange={(e) => setFiltros({ ...filtros, estudianteId: e.target.value })}
                >
                  <option value="">Todos</option>
                  {estudiantes.map(est => (
                    <option key={est.id} value={est.id}>{est.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Parcial</label>
                <select
                  className="form-select"
                  value={filtros.parcial}
                  onChange={(e) => setFiltros({ ...filtros, parcial: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="1">Parcial 1</option>
                  <option value="2">Parcial 2</option>
                  <option value="3">Parcial 3</option>
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Ordenar Por</label>
                <select
                  className="form-select"
                  value={filtros.ordenar}
                  onChange={(e) => setFiltros({ ...filtros, ordenar: e.target.value })}
                >
                  <option value="reciente">Más reciente</option>
                  <option value="mayor">Mayor nota</option>
                  <option value="menor">Menor nota</option>
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">&nbsp;</label>
                <button type="submit" className="btn btn-outline-secondary w-100">
                  <i className="bi bi-search"></i> Filtrar
                </button>
              </div>
            </div>
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
                  <th>Estudiante</th>
                  <th>Parcial</th>
                  <th>Tarea</th>
                  <th>Informe</th>
                  <th>Lección</th>
                  <th>Examen</th>
                  <th>Nota Final</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {notas.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      No hay notas registradas
                    </td>
                  </tr>
                ) : (
                  notas.map((nota) => (
                    <tr key={nota.id}>
                      <td>{nota.id}</td>
                      <td>{nota.Estudiante?.nombre || 'N/A'}</td>
                      <td>Parcial {nota.parcial}</td>
                      <td>{nota.tarea}</td>
                      <td>{nota.informe}</td>
                      <td>{nota.leccion}</td>
                      <td>{nota.examen}</td>
                      <td>
                        <span className="badge bg-info">
                          {nota.notaFinal || calcularNotaFinal(nota.tarea, nota.informe, nota.leccion, nota.examen)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEditar(nota)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleEliminar(nota)}
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
        title="Eliminar Nota"
        message={`¿Está seguro de que desea eliminar esta nota?`}
        onConfirm={confirmarEliminar}
        onCancel={() => setShowModal(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDanger={true}
      />
    </div>
  );
}
