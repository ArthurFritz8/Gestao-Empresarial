import axios from 'axios';

// Configuração do axios para apontar para o backend
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;