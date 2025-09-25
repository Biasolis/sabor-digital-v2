import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStoragedData = async () => {
      const storagedUser = localStorage.getItem('@SaborDigital:user');
      const storagedToken = localStorage.getItem('@SaborDigital:token');

      if (storagedUser && storagedToken) {
        setUser(JSON.parse(storagedUser));
        api.defaults.headers.authorization = `Bearer ${storagedToken}`;
      }
      setLoading(false);
    };

    loadStoragedData();
  }, []);

  const login = async ({ subdomain, email, password }) => {
    try {
      const response = await api.post('/auth/login', {
        subdomain,
        email,
        password,
      });

      const { token, user: userData, tenant } = response.data;

      localStorage.setItem('@SaborDigital:user', JSON.stringify(userData));
      localStorage.setItem('@SaborDigital:token', token);
      localStorage.setItem('@SaborDigital:tenant', JSON.stringify(tenant));

      api.defaults.headers.authorization = `Bearer ${token}`;
      setUser(userData);

      toast.success(`Bem-vindo, ${userData.name}!`);
      navigate('/dashboard'); // Redireciona para o dashboard após o login
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login. Tente novamente.';
      toast.error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('@SaborDigital:user');
    localStorage.removeItem('@SaborDigital:token');
    localStorage.removeItem('@SaborDigital:tenant');
    localStorage.removeItem('@SaborDigital:superadmin_token'); // Limpa também o token do superadmin
    
    setUser(null);
    api.defaults.headers.authorization = undefined;
    
    navigate('/login');
    toast.info('Você foi desconectado.');
  };

  // NOVA FUNÇÃO para retornar ao modo Super Admin
  const stopImpersonation = async () => {
    const superAdminToken = localStorage.getItem('@SaborDigital:superadmin_token');
    if (!superAdminToken) {
      toast.error("Nenhuma sessão de Super Admin encontrada para restaurar.");
      return;
    }

    // Limpa os dados de acesso temporário
    localStorage.removeItem('@SaborDigital:user');
    localStorage.removeItem('@SaborDigital:token');
    localStorage.removeItem('@SaborDigital:tenant');
    
    // Restaura o token original do Super Admin
    localStorage.setItem('@SaborDigital:token', superAdminToken);
    localStorage.removeItem('@SaborDigital:superadmin_token');

    // Busca novamente os dados do superadmin e atualiza o estado
    try {
        api.defaults.headers.authorization = `Bearer ${superAdminToken}`;
        const response = await api.get('/superadmin/me');
        const superAdminUser = { ...response.data, name: 'Super Admin' }; // Adapta o nome para exibição
        
        localStorage.setItem('@SaborDigital:user', JSON.stringify(superAdminUser));
        setUser(superAdminUser);

        toast.success("Sessão de Super Admin restaurada!");
        navigate('/superadmin/dashboard');

    } catch (error) {
        toast.error("Falha ao restaurar a sessão. Faça login novamente.");
        logout(); // Desloga completamente em caso de falha
    }
  };


  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout, stopImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
};