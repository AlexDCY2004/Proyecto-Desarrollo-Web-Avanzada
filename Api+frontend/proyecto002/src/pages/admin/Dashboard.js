import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { logout, obtenerUsuarioActual } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

// Subpáginas del Dashboard
function InicioPage() {
  return (
    <div className="container mt-4">
      <h2>Panel de Inicio</h2>
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title">Estudiantes Activos</h5>
              <p className="card-text display-4">150</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h5 className="card-title">Docentes</h5>
              <p className="card-text display-4">25</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-info mb-3">
            <div className="card-body">
              <h5 className="card-title">Cursos</h5>
              <p className="card-text display-4">12</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EstudiantePage() {
  return (
    <div className="container mt-4">
      <h2>Gestión de Estudiantes</h2>
      <p>Aquí irá el CRUD de estudiantes</p>
    </div>
  );
}

function DocentePage() {
  return (
    <div className="container mt-4">
      <h2>Gestión de Docentes</h2>
      <p>Aquí irá el CRUD de docentes</p>
    </div>
  );
}

function AyudaPage() {
  return (
    <div className="container mt-4">
      <h2>Ayuda</h2>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Manual de Usuario</h5>
          <p className="card-text">Sistema de Gestión Académica v1.0</p>
          <h6>Funcionalidades:</h6>
          <ul>
            <li>Gestión de Estudiantes</li>
            <li>Gestión de Docentes</li>
            <li>Registro de Notas</li>
            <li>Generación de Reportes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActual();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/admin">
            <i className="bi bi-mortarboard-fill me-2"></i>
            Sistema Académico
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/admin/inicio">
                  <i className="bi bi-house-door me-1"></i>
                  Inicio
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/estudiante">
                  <i className="bi bi-people me-1"></i>
                  Estudiante
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/docente">
                  <i className="bi bi-person-badge me-1"></i>
                  Docente
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/ayuda">
                  <i className="bi bi-question-circle me-1"></i>
                  Ayuda
                </Link>
              </li>
            </ul>
            <div className="d-flex align-items-center text-white">
              <i className="bi bi-person-circle me-2"></i>
              <span className="me-3">{usuario?.nombre}</span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/inicio" replace />} />
          <Route path="/inicio" element={<InicioPage />} />
          <Route path="/estudiante" element={<EstudiantePage />} />
          <Route path="/docente" element={<DocentePage />} />
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