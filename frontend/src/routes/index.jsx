import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../layout/MainLayout';
import SuperAdminLayout from '../layout/SuperAdminLayout'; // 1. Importa o novo layout
import Menu from '../pages/Menu';
import AdminMenu from '../pages/AdminMenu';
import TablePage from '../pages/Tables';
import PDVPage from '../pages/PDV';
import OrderDetailPage from '../pages/OrderDetail';
import KitchenPage from '../pages/Kitchen';
import UsersPage from '../pages/Users';
import CashierPage from '../pages/Cashier';
import InventoryPage from '../pages/Inventory';
import ReceiptPage from '../pages/Receipt';
import SuperAdminLogin from '../pages/SuperAdmin/Login';
import SuperAdminDashboard from '../pages/SuperAdmin/Dashboard'; // 2. Importa o novo dashboard
import TenantsPage from '../pages/SuperAdmin/Tenants'; // 3. Importa a página de tenants (antigo dashboard)
import SettingsPage from '../pages/Settings';
import PlansPage from '../pages/SuperAdmin/Plans';
import ReportsPage from '../pages/Reports';

const LandingPage = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Bem-vindo ao Sabor Digital!</h1>
    <p>A sua solução completa para gestão de restaurantes.</p>
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
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      
      {/* Rotas do Admin da Loja (Layout Padrão) */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/reports" element={<ReportsPage />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/admin/tables" element={<TablePage />} />
        <Route path="/admin/inventory" element={<InventoryPage />} />
        <Route path="/pdv" element={<PDVPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/cashier" element={<CashierPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 4. Agrupamento das Rotas do Super Admin sob o novo Layout */}
      <Route element={<PrivateRoute><SuperAdminLayout /></PrivateRoute>}>
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/tenants" element={<TenantsPage />} />
        <Route path="/superadmin/plans" element={<PlansPage />} />
      </Route>

      {/* Rotas sem layout principal */}
      <Route path="/order/:orderId" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
      <Route path="/receipt/:orderId" element={<PrivateRoute><ReceiptPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;