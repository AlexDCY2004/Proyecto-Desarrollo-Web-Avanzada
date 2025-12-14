import apiClient from './apiClient';

// Listar notas con filtros opcionales
export const listarNotas = async (filtros = {}) => {
  try {
    const response = await apiClient.get('/api/notas', { params: filtros });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener nota por ID
export const obtenerNota = async (id) => {
  try {
    const response = await apiClient.get(`/api/notas/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear nota
export const crearNota = async (datos) => {
  try {
    const response = await apiClient.post('/api/notas', datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar nota
export const actualizarNota = async (id, datos) => {
  try {
    const response = await apiClient.put(`/api/notas/${id}`, datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar nota (eliminación lógica)
export const eliminarNota = async (id) => {
  try {
    const response = await apiClient.put(`/api/notas/${id}`, {
      estado: 'eliminada'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Calcular promedio de un estudiante
export const calcularPromedioEstudiante = async (estudianteId) => {
  try {
    const response = await apiClient.get(`/api/notas/estudiante/${estudianteId}/promedio`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
