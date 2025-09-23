import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../layout/MainLayout'; // Importa o nosso novo layout

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rota "wrapper" para todas as páginas logadas */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* Rotas aninhadas que serão renderizadas dentro do MainLayout */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Rota padrão: se o usuário acessar "/", redireciona para "/dashboard" */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Adicione outras rotas privadas aqui no futuro, ex: */}
          {/* <Route path="/menu" element={<MenuPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;