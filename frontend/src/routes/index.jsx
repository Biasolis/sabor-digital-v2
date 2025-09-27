import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layout/MainLayout';
import SuperAdminLayout from '../layout/SuperAdminLayout';
import WebsiteLayout from '../layout/WebsiteLayout'; 

// Middlewares de Rota
import PrivateRoute from './PrivateRoute';
import CustomerPrivateRoute from './CustomerPrivateRoute';

// Páginas do Site Público
import HomePage from '../pages/Website/Home'; 
import PlansPage from '../pages/Website/Plans'; 
import SignupPage from '../pages/Website/Signup'; // NOVA IMPORTAÇÃO

// Páginas de Admin
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
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
import OrdersPage from '../pages/Orders';

// Páginas de Super Admin
import SuperAdminLogin from '../pages/SuperAdmin/Login';
import SuperAdminDashboard from '../pages/SuperAdmin/Dashboard';
import TenantsPage from '../pages/SuperAdmin/Tenants';
import SuperAdminPlansPage from '../pages/SuperAdmin/Plans';
import SuperAdminReports from '../pages/SuperAdmin/Reports';
import SuperAdminProfilePage from '../pages/SuperAdmin/Profile';

// Páginas do Cardápio e Cliente
import Menu from '../pages/Menu';
import CustomerLogin from '../pages/Customers/Login';
import CustomerRegister from '../pages/Customers/Register';
import MyOrderPage from '../pages/Customers/MyOrder';

// Componente para decidir entre site principal e cardápio do tenant
const RootPage = () => {
    // Esta lógica pode precisar de ajuste dependendo de como você hospeda
    const host = window.location.hostname;
    const isMainSite = host === 'localhost' || host === 'www.sabordigital.com' || host === 'sabordigital.com';

    if (isMainSite) {
        return <HomePage />;
    }
    // Qualquer outro subdomínio carrega o Menu
    return <Menu />;
};


const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas do Site Público com o novo Layout */}
      <Route element={<WebsiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/planos" element={<PlansPage />} />
        <Route path="/signup" element={<SignupPage />} /> {/* NOVA ROTA */}
      </Route>

      {/* Rota do Cardápio (acessado via subdomínio) */}
      <Route path="/menu" element={<Menu />} />

      {/* Rotas de Cliente */}
      <Route path="/customer-login" element={<CustomerLogin />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/my-order" element={<CustomerPrivateRoute><MyOrderPage /></CustomerPrivateRoute>} />

      {/* Rota de Login de Funcionário e Super Admin */}
      <Route path="/login" element={<Login />} />
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      
      {/* Rotas de Super Admin */}
      <Route element={<PrivateRoute><SuperAdminLayout /></PrivateRoute>}>
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/tenants" element={<TenantsPage />} />
        <Route path="/superadmin/plans" element={<SuperAdminPlansPage />} />
        <Route path="/superadmin/reports" element={<SuperAdminReports />} />
        <Route path="/superadmin/profile" element={<SuperAdminProfilePage />} />
      </Route>

      {/* Rotas de Funcionários (Tenant) */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/admin/tables" element={<TablePage />} />
        <Route path="/admin/inventory" element={<InventoryPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/pdv" element={<PDVPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/cashier" element={<CashierPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/order/:orderId" element={<OrderDetailPage />} />
        <Route path="/receipt/:orderId" element={<ReceiptPage />} />
      </Route>

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;