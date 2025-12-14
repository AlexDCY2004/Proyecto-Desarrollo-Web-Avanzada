import apiClient from './apiClient';

// Crear consulta/ticket de ayuda
export const crearConsulta = async (datos) => {
  try {
    const response = await apiClient.post('/api/consultas', datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Listar consultas
export const listarConsultas = async (filtros = {}) => {
  try {
    const response = await apiClient.get('/api/consultas', { params: filtros });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener consulta por ID
export const obtenerConsulta = async (id) => {
  try {
    const response = await apiClient.get(`/api/consultas/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar consulta (responder o cambiar estado)
export const actualizarConsulta = async (id, datos) => {
  try {
    const response = await apiClient.put(`/api/consultas/${id}`, datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar consulta
export const eliminarConsulta = async (id) => {
  try {
    const response = await apiClient.delete(`/api/consultas/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
