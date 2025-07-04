import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: userData } = await auth.login(email, password);
      setUser(userData);
      toast.success(`Bem-vindo, ${userData.name}!`);
    } catch (error) {
      // Erro já tratado pelo interceptor
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const { user: userData } = await auth.register({ name, email, password });
      setUser(userData);
      toast.success(`Conta criada com sucesso! Bem-vindo, ${userData.name}!`);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    auth.logout();
    toast.success('Logout realizado com sucesso!');
  };

  // Verificar se usuário está logado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (auth.isAuthenticated()) {
          const userData = auth.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // Token existe mas usuário não, buscar do servidor
            const profile = await auth.getProfile();
            setUser(profile);
          }
        }
      } catch (error) {
        // Token inválido, limpar dados
        auth.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};