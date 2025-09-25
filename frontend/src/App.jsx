import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';

import { AuthProvider } from './contexts/AuthContext';
import { TenantThemeProvider } from './contexts/TenantThemeContext'; // 1. Importar o novo Provedor
import AppRoutes from './routes';

function App() {
  return (
    // 2. Envolver o AppRoutes com o TenantThemeProvider
    <TenantThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider theme={theme}> {/* Este tema pode ser mantido para o painel de admin */}
            <CssBaseline />
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TenantThemeProvider>
  );
}

export default App;