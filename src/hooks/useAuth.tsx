import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import authApi from '../services/authApi'; 
import api from '../services/api';

// 1. Definição do Tipo do Contexto (incluindo createAdmin)
type AuthContextType = {
  accessToken: string | null;
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  // A função nova que o componente CriarAdmin precisa:
  createAdmin: (email: string, password: string, name: string) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Configura o Token nos headers (Tanto para API quanto para AuthApi)
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      // IMPORTANTE: O AuthApi também precisa do token para acessar a rota /admin
      authApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      localStorage.setItem('accessToken', accessToken);
    } else {
      delete api.defaults.headers.common['Authorization'];
      delete authApi.defaults.headers.common['Authorization'];
    }
  }, [accessToken]); 

  // Carga inicial ao dar F5
  useEffect(() => {
    const loadStorageData = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setAccessToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        authApi.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        await fetchUser();
      }
      setLoading(false);
    };
    loadStorageData();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me').catch(() => api.get('/me')); 
      setUser(res.data);
    } catch (e) { }

    const candidatePaths = ['/users/me', '/clientes/me'];
    for (const path of candidatePaths) {
      try {
        const res = await api.get(path);
        setUser(res.data);
        return;
      } catch (err) { }
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.post('/auth/login', { email, password });
      const { accessToken } = response.data;
      setAccessToken(accessToken);
      await fetchUser();
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 2. Implementação da função createAdmin
  const createAdmin = async (email: string, password: string, name: string) => {
    try {
      // Chama a rota /auth/admin (que exige token de admin no header)
      await authApi.post('/auth/admin', { email, password, name });
      return {}; // Retorna vazio se deu certo
    } catch (error: any) {
      console.error('Erro ao criar admin:', error);
      const errorMsg = error.response?.data?.error || 'Erro desconhecido ao criar administrador.';
      return { error: errorMsg };
    }
  };

  const signOut = () => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  };

  // 3. Disponibilizamos a função no valor do contexto
  const value = { accessToken, user, loading, signIn, signOut, createAdmin };

  if (loading) return null; 

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};