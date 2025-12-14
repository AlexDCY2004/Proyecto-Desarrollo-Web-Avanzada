import apiClient from './apiClient';

// Listar estudiantes
export const listarEstudiantes = async () => {
  try {
    const response = await apiClient.get('/api/estudiantes');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener estudiante por ID
export const obtenerEstudiante = async (id) => {
  try {
    const response = await apiClient.get(`/api/estudiantes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buscar estudiante por cédula, nombre o ID
export const buscarEstudiante = async (busqueda) => {
  try {
    const response = await apiClient.get('/api/estudiantes/buscar', {
      params: { busqueda }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear estudiante
export const crearEstudiante = async (datos) => {
  try {
    const response = await apiClient.post('/api/estudiantes', datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar estudiante
export const actualizarEstudiante = async (id, datos) => {
  try {
    const response = await apiClient.put(`/api/estudiantes/${id}`, datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar estudiante (eliminación lógica)
export const eliminarEstudiante = async (id) => {
  try {
    // Cambiar estado a inactivo en lugar de eliminar
    const response = await apiClient.put(`/api/estudiantes/${id}`, {
      estado: 'inactivo'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
