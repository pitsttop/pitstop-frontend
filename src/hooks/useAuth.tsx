import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import authApi from '../services/authApi'; 
import api from '../services/api';

type AuthContextType = {
  accessToken: string | null;
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- MUDANÇA 1: O "VIGILANTE" DO TOKEN ---
  // Sempre que o accessToken mudar (login ou logout), configuramos o Axios.
  useEffect(() => {
    if (accessToken) {
      // Cola o crachá na testa do mensageiro (Axios)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      localStorage.setItem('accessToken', accessToken);
    } else {
      // Remove o crachá se não tiver token
      delete api.defaults.headers.common['Authorization'];
      // Não removemos do localStorage aqui para permitir o fluxo de refresh, 
      // mas o signOut faz isso explicitamente.
    }
  }, [accessToken]); 

  // --- MUDANÇA 2: CARGA INICIAL (F5) ---
  useEffect(() => {
    const loadStorageData = async () => {
      const storedToken = localStorage.getItem('accessToken');
      
      if (storedToken) {
        setAccessToken(storedToken);
        // IMPORTANTE: Injetamos manualmente aqui também para garantir
        // que a requisição fetchUser abaixo já vá com o token.
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        await fetchUser();
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  const fetchUser = async () => {
    // Tenta a rota padrão /me
    try {
      // Ajuste para bater na sua API de Auth ou Backend, dependendo de onde está o /me
      const res = await api.get('/auth/me').catch(() => api.get('/me')); 
      setUser(res.data);
      return;
    } catch (e) {
       // Silencioso no primeiro erro
    }

    // Fallbacks se a rota principal falhar
    const candidatePaths = ['/users/me', '/clientes/me'];
    for (const path of candidatePaths) {
      try {
        const res = await api.get(path);
        setUser(res.data);
        return;
      } catch (err) {
        // continua tentando
      }
    }
    console.warn('fetchUser: Não foi possível obter dados do usuário.');
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.post('/auth/login', { email, password });
      const { accessToken } = response.data;

      // Ao setar o estado aqui, o useEffect lá de cima (Mudança 1) dispara 
      // e configura o Axios e o LocalStorage automaticamente.
      setAccessToken(accessToken);
      
      // Espera um pouquinho para o estado atualizar e busca o user
      await fetchUser();
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
    // O useEffect vai limpar o header do axios automaticamente
  };

  const value = { accessToken, user, loading, signIn, signOut };

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