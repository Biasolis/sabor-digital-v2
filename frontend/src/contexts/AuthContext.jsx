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
    
    setUser(null);
    api.defaults.headers.authorization = undefined;
    
    navigate('/login');
    toast.info('Você foi desconectado.');
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout }}>
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