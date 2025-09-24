import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Rotas de Funcionários e Admin
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../layout/MainLayout';
import AdminMenu from '../pages/AdminMenu';
import TablePage from '../pages/Tables';
import PDVPage from '../pages/PDV';
import OrderDetailPage from '../pages/OrderDetail';
import KitchenPage from '../pages/Kitchen';
import UsersPage from '../pages/Users';
import CashierPage from '../pages/Cashier';
import InventoryPage from '../pages/Inventory';
import ReceiptPage from '../pages/Receipt';
import SettingsPage from '../pages/Settings';
import ReportsPage from '../pages/Reports';
import CustomersPage from '../pages/Customers';

// Rotas de Super Admin
import SuperAdminLayout from '../layout/SuperAdminLayout';
import SuperAdminLogin from '../pages/SuperAdmin/Login';
import SuperAdminDashboard from '../pages/SuperAdmin/Dashboard';
import TenantsPage from '../pages/SuperAdmin/Tenants';
import PlansPage from '../pages/SuperAdmin/Plans';

// Rotas Públicas e de Clientes (CAMINHOS CORRIGIDOS)
import Menu from '../pages/Menu';
import CustomerLogin from '../pages/Customer/Login/index.jsx';
import CustomerRegister from '../pages/Customer/Register/index.jsx';
import MyOrderPage from '../pages/Customer/MyOrder/index.jsx';
import CustomerPrivateRoute from './CustomerPrivateRoute.jsx';


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
      {/* Rotas Públicas e de Cliente */}
      <Route path="/" element={<RootPage />} />
      <Route path="/customer-login" element={<CustomerLogin />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/my-order" element={<CustomerPrivateRoute><MyOrderPage /></CustomerPrivateRoute>} />

      {/* Rota de Login de Funcionário */}
      <Route path="/login" element={<Login />} />
      
      {/* Rotas de Super Admin */}
      <Route element={<PrivateRoute><SuperAdminLayout /></PrivateRoute>}>
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/tenants" element={<TenantsPage />} />
        <Route path="/superadmin/plans" element={<PlansPage />} />
      </Route>

      {/* Rotas de Funcionários (Tenant) */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/admin/tables" element={<TablePage />} />
        <Route path="/admin/inventory" element={<InventoryPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/pdv" element={<PDVPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/cashier" element={<CashierPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Rotas sem layout principal, mas ainda protegidas */}
        <Route path="/order/:orderId" element={<OrderDetailPage />} />
        <Route path="/receipt/:orderId" element={<ReceiptPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;