import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000
});

console.log('✓ Axios configurado con baseURL:', api.defaults.baseURL);

export default api;