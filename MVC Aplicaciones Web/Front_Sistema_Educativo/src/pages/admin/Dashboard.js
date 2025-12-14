import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { logout, obtenerUsuarioActual } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import EstudiantePage from '../EstudiantePage';
import DocentePage from '../DocentePage';
import NotaPage from '../NotaPage';

// Subpáginas del Dashboard
function InicioPage() {
  const usuario = obtenerUsuarioActual();
  const rolActual = usuario?.rol || 'admin';
  const base = `/${rolActual}`;

  return (
    <div className="container mt-4">
      <h2>
        <i className="bi bi-house-door-fill me-2"></i>
        Panel de Inicio
      </h2>
      <p className="text-muted">Bienvenido al Sistema de Gestión Académica</p>
      
      <div className="row mt-4">
        <div className="col-md-4 mb-3">
          <Link to={`${base}/estudiante`} className="text-decoration-none">
            <div className="card text-white bg-primary h-100 hover-shadow" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-people-fill me-2"></i>
                  Estudiantes Activos
                </h5>
                <p className="card-text display-4">150</p>
                <small className="text-white-50">
                  <i className="bi bi-arrow-right-circle me-1"></i>
                  Click para gestionar
                </small>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4 mb-3">
          <Link to={`${base}/docente`} className="text-decoration-none">
            <div className="card text-white bg-success h-100 hover-shadow" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-person-badge me-2"></i>
                  Docentes
                </h5>
                <p className="card-text display-4">25</p>
                <small className="text-white-50">
                  <i className="bi bi-arrow-right-circle me-1"></i>
                  Click para gestionar
                </small>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4 mb-3">
          <Link to={`${base}/notas`} className="text-decoration-none">
            <div className="card text-white bg-info h-100 hover-shadow" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-book me-2"></i>
                  Notas y Evaluaciones
                </h5>
                <p className="card-text display-4">450</p>
                <small className="text-white-50">
                  <i className="bi bi-arrow-right-circle me-1"></i>
                  Click para gestionar
                </small>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Últimas Actividades
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">
                      <i className="bi bi-person-plus-fill text-primary me-2"></i>
                      Estudiante registrado
                    </h6>
                    <p className="text-muted mb-0 small">Juan Pérez González - Hace 2 horas</p>
                  </div>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">
                      <i className="bi bi-file-earmark-text-fill text-success me-2"></i>
                      Nota registrada
                    </h6>
                    <p className="text-muted mb-0 small">Matemática - Parcial 1 - Nota: 15.4/20 - Hace 1 hora</p>
                  </div>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">
                      <i className="bi bi-person-badge-fill text-info me-2"></i>
                      Docente actualizado
                    </h6>
                    <p className="text-muted mb-0 small">Dr. Carlos Martínez - Hace 3 horas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">
                <i className="bi bi-bell-fill me-2"></i>
                Notificaciones Recientes
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-exclamation-triangle-fill text-warning me-3 fs-5"></i>
                    <div>
                      <h6 className="mb-1">3 estudiantes con notas pendientes</h6>
                      <p className="text-muted mb-0 small">Parcial 2 - Matemática</p>
                    </div>
                  </div>
                </div>
                <div className="list-group-item">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-calendar-event-fill text-info me-3 fs-5"></i>
                    <div>
                      <h6 className="mb-1">Próximo evento: Examen Final</h6>
                      <p className="text-muted mb-0 small">15 de Diciembre, 2025</p>
                    </div>
                  </div>
                </div>
                <div className="list-group-item">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-check-circle-fill text-success me-3 fs-5"></i>
                    <div>
                      <h6 className="mb-1">Sistema actualizado</h6>
                      <p className="text-muted mb-0 small">Versión 2.0 - Nuevas funcionalidades</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar3 me-2"></i>
                Calendario de Próximos Eventos
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="border rounded p-3 h-100">
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-primary text-white rounded p-2 me-3">
                        <strong>15</strong><br/>
                        <small>DIC</small>
                      </div>
                      <div>
                        <h6 className="mb-0">Exámenes Finales</h6>
                        <small className="text-muted">Parcial 3 - Todas las materias</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="border rounded p-3 h-100">
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-success text-white rounded p-2 me-3">
                        <strong>20</strong><br/>
                        <small>DIC</small>
                      </div>
                      <div>
                        <h6 className="mb-0">Entrega de Calificaciones</h6>
                        <small className="text-muted">Cierre de semestre</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="border rounded p-3 h-100">
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-info text-white rounded p-2 me-3">
                        <strong>05</strong><br/>
                        <small>ENE</small>
                      </div>
                      <div>
                        <h6 className="mb-0">Inicio Nuevo Semestre</h6>
                        <small className="text-muted">Matrícula y asignaciones</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AyudaPage() {
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
    tipo: 'consulta'
  });
  const [alert, setAlert] = useState({ show: false });
  const [cargando, setCargando] = useState(false);
  const usuario = obtenerUsuarioActual();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const datos = {
        ...formulario,
        usuarioId: usuario?.id || null
      };

      const response = await fetch('http://localhost:3000/api/consultas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({ 
          show: true, 
          type: 'success', 
          message: '✅ Consulta enviada exitosamente. Te responderemos pronto.' 
        });
        setFormulario({
          nombre: '',
          email: '',
          asunto: '',
          mensaje: '',
          tipo: 'consulta'
        });
      } else {
        throw new Error(result.error || 'Error al enviar consulta');
      }
    } catch (error) {
      setAlert({ 
        show: true, 
        type: 'danger', 
        message: `❌ Error: ${error.message}` 
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>
        <i className="bi bi-question-circle-fill me-2"></i>
        Centro de Ayuda y Soporte
      </h2>
      
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show mt-3`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false })}></button>
        </div>
      )}

      <div className="row mt-4">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-book-fill me-2"></i>
                Manual de Uso
              </h5>
            </div>
            <div className="card-body">
              <h6>Secciones Disponibles:</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Gestión de Estudiantes</strong><br/>
                  <small className="text-muted">Crear, editar, buscar y eliminar estudiantes</small>
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Gestión de Docentes</strong><br/>
                  <small className="text-muted">Administrar información de profesores</small>
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Registro de Notas</strong><br/>
                  <small className="text-muted">Sistema de calificaciones con cálculo automático</small>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">
                <i className="bi bi-gear-fill me-2"></i>
                Funcionalidades
              </h5>
            </div>
            <div className="card-body">
              <h6>CRUD Completo:</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="bi bi-plus-circle me-2 text-primary"></i>
                  <strong>Crear:</strong> Agregar nuevos registros
                </li>
                <li className="mb-2">
                  <i className="bi bi-eye me-2 text-info"></i>
                  <strong>Leer:</strong> Visualizar información
                </li>
                <li className="mb-2">
                  <i className="bi bi-pencil-square me-2 text-warning"></i>
                  <strong>Editar:</strong> Actualizar datos
                </li>
                <li className="mb-2">
                  <i className="bi bi-trash me-2 text-danger"></i>
                  <strong>Eliminar:</strong> Desactivar registros
                </li>
                <li className="mb-2">
                  <i className="bi bi-search me-2 text-success"></i>
                  <strong>Buscar:</strong> Filtros avanzados
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-calculator-fill me-2"></i>
                Sistema de Notas
              </h5>
            </div>
            <div className="card-body">
              <h6>Cálculo Automático:</h6>
              <ul className="list-unstyled small">
                <li className="mb-1">• Tarea: 20%</li>
                <li className="mb-1">• Informe: 20%</li>
                <li className="mb-1">• Lección: 20%</li>
                <li className="mb-1">• Examen: 40%</li>
              </ul>
              <hr/>
              <p className="mb-1"><strong>3 Parciales</strong> (14 pts c/u)</p>
              <p className="mb-1"><strong>Total:</strong> 42 puntos</p>
              <p className="mb-0"><strong>Mínimo:</strong> 28 pts (P1+P2)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-envelope-fill me-2"></i>
                Formulario de Contacto y Soporte
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                ¿Tienes alguna pregunta o problema? Completa el formulario y te responderemos pronto.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombre"
                      value={formulario.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formulario.email}
                      onChange={handleChange}
                      required
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tipo de Consulta *</label>
                    <select
                      className="form-select"
                      name="tipo"
                      value={formulario.tipo}
                      onChange={handleChange}
                      required
                    >
                      <option value="consulta">Consulta General</option>
                      <option value="problema">Reportar Problema</option>
                      <option value="sugerencia">Sugerencia de Mejora</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Asunto *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="asunto"
                      value={formulario.asunto}
                      onChange={handleChange}
                      required
                      placeholder="Breve descripción del asunto"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Mensaje *</label>
                  <textarea
                    className="form-control"
                    name="mensaje"
                    rows="5"
                    value={formulario.mensaje}
                    onChange={handleChange}
                    required
                    placeholder="Describe tu consulta o problema en detalle..."
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setFormulario({
                      nombre: '',
                      email: '',
                      asunto: '',
                      mensaje: '',
                      tipo: 'consulta'
                    })}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Limpiar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={cargando}
                  >
                    {cargando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2"></i>
                        Enviar Consulta
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle-fill me-2"></i>
                Preguntas Frecuentes (FAQ)
              </h5>
            </div>
            <div className="card-body">
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      ¿Cómo registro un nuevo estudiante?
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Ve a la sección "Estudiante", haz click en el botón "Nuevo Estudiante" y completa el formulario con los datos requeridos.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      ¿Cómo se calculan las notas?
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      El sistema calcula automáticamente: Tarea (20%) + Informe (20%) + Lección (20%) + Examen (40%). La nota final se calcula sobre 20 puntos.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      ¿Puedo recuperar un registro eliminado?
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Las eliminaciones son lógicas (cambian el estado a "inactivo"). Puedes contactar al administrador para reactivar un registro.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActual();
  const location = useLocation();

  // Determinar base del dashboard según rol o pathname
  const rolActual = usuario?.rol || (location.pathname.split('/')[1] || 'admin');
  const base = `/${rolActual}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to={base}>
            <i className="bi bi-mortarboard-fill me-2"></i>
            Sistema Académico
          </Link>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to={`${base}/inicio`}>
                <i className="bi bi-house-door me-1"></i>
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`${base}/estudiante`}>
                <i className="bi bi-people me-1"></i>
                Estudiante
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`${base}/docente`}>
                <i className="bi bi-person-badge me-1"></i>
                Docente
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`${base}/notas`}>
                <i className="bi bi-file-earmark-text me-1"></i>
                Notas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`${base}/ayuda`}>
                <i className="bi bi-question-circle me-1"></i>
                Ayuda
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center text-white">
            <i className="bi bi-person-circle me-2"></i>
            <span className="me-3">{usuario?.username}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Navigate to={`${base}/inicio`} replace />} />
          <Route path="/inicio" element={<InicioPage />} />
          <Route path="/estudiante" element={<EstudiantePage />} />
          <Route path="/docente" element={<DocentePage />} />
          <Route path="/notas" element={<NotaPage />} />
          <Route path="/ayuda" element={<AyudaPage />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p className="mb-0">© 2024 Sistema de Gestión Académica</p>
      </footer>
    </div>
  );
}