// src/services/authApi.ts
import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

const authApi = axios.create({
  baseURL: AUTH_API_URL, // Ex: 'http://localhost:3002'
});

export default authApi;