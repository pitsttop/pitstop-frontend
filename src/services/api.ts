import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL, // Ex: 'http://localhost:3001'
});

// --- O CÓDIGO MAIS IMPORTANTE ---
// Intercepta CADA chamada para o Backend (Repo 2)
api.interceptors.request.use(
  (config) => {
    // 1. Pega a "pulseira" (token) do localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 2. Anexa no cabeçalho 'Authorization'
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // 3. Envia a requisição
  },
  (error) => Promise.reject(error)
);

export default api;