import React from 'react';
// Certifique-se de que 'BrowserRouter' NÃO está sendo importado aqui
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../layout/MainLayout';
import Menu from '../pages/Menu';
import AdminMenu from '../pages/AdminMenu';
import TablePage from '../pages/Tables';
import PDVPage from '../pages/PDV';
import OrderDetailPage from '../pages/OrderDetail';
import KitchenPage from '../pages/Kitchen';
import UsersPage from '../pages/Users';
import CashierPage from '../pages/Cashier';
import InventoryPage from '../pages/Inventory';

const LandingPage = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Bem-vindo ao Sabor Digital!</h1>
    <p>A sua solução completa para gestão de restaurantes.</p>
    <p>Em breve: planos, funcionalidades e muito mais.</p>
  </div>
);

const RootPage = () => {
    const host = window.location.hostname;
    const parts = host.split('.');
    const isTenantSite = (parts.length > 2 && parts[0] !== 'www') || host.includes('localhost');

    if (isTenantSite) {
        return <Menu />;
    } else {
        return <LandingPage />;
    }
};

const AppRoutes = () => {
  return (
    // GARANTA QUE NÃO HÁ <BrowserRouter> ENVOLVENDO AS ROTAS AQUI
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/login" element={<Login />} />
      
      <Route 
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/admin/tables" element={<TablePage />} />
        <Route path="/admin/inventory" element={<InventoryPage />} /> {/* Nova rota */}
        <Route path="/pdv" element={<PDVPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/cashier" element={<CashierPage />} />
      </Route>

      <Route
        path="/order/:orderId"
        element={
          <PrivateRoute>
            <OrderDetailPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;