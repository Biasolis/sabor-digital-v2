import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import api from '../services/api';

const TenantThemeContext = createContext();

// Tema base/padrão
const baseTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Azul padrão
    },
    secondary: {
      main: '#dc004e', // Rosa padrão
    },
  },
});

export const TenantThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(baseTheme);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantAndSetTheme = async () => {
      try {
        const { data } = await api.get('/tenants/public');
        setTenantInfo(data);

        // Se o tenant tiver cores customizadas, cria um novo tema
        if (data.primary_color || data.secondary_color) {
          const dynamicTheme = createTheme({
            palette: {
              primary: {
                main: data.primary_color || baseTheme.palette.primary.main,
              },
              secondary: {
                main: data.secondary_color || baseTheme.palette.secondary.main,
              },
            },
          });
          setTheme(dynamicTheme);
        }
      } catch (error) {
        console.error("Não foi possível carregar o tema do tenant, usando tema padrão.");
        // Em caso de erro, mantém o tema padrão
        setTheme(baseTheme);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantAndSetTheme();
  }, []);

  // O useMemo garante que o valor do contexto só seja recalculado quando necessário
  const value = useMemo(() => ({
    theme,
    tenantInfo,
    loading
  }), [theme, tenantInfo, loading]);

  return (
    <TenantThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </TenantThemeContext.Provider>
  );
};

// Hook customizado para usar o contexto facilmente
export const useTenantTheme = () => {
  const context = useContext(TenantThemeContext);
  if (!context) {
    throw new Error('useTenantTheme deve ser usado dentro de um TenantThemeProvider');
  }
  return context;
};