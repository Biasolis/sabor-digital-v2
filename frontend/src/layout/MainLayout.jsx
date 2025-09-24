import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, CssBaseline, Divider, Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BadgeIcon from '@mui/icons-material/Badge'; // Ícone para Clientes
import api from '../services/api';

const drawerWidth = 240;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tenantInfo, setTenantInfo] = useState({ name: 'Carregando...', is_open: true });

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const { data } = await api.get('/tenants/me');
        setTenantInfo(data);
      } catch (error) {
        console.error("Erro ao buscar dados do tenant no layout.");
        const storedTenant = JSON.parse(localStorage.getItem('@SaborDigital:tenant'));
        if (storedTenant) {
          setTenantInfo(prev => ({ ...prev, name: storedTenant.name }));
        }
      }
    };
    fetchTenantInfo();
  }, []);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'PDV', icon: <PointOfSaleIcon />, path: '/pdv' },
    { text: 'Cozinha', icon: <SoupKitchenIcon />, path: '/kitchen' },
    { text: 'Caixa', icon: <AttachMoneyIcon />, path: '/cashier' },
  ];

  const adminMenuItems = [
    { isDivider: true },
    { text: 'Relatórios', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Cardápio', icon: <RestaurantMenuIcon />, path: '/admin/menu' },
    { text: 'Clientes', icon: <BadgeIcon />, path: '/customers' }, // 3. Novo item de menu
    { text: 'Estoque', icon: <InventoryIcon />, path: '/admin/inventory' },
    { text: 'Mesas', icon: <TableRestaurantIcon />, path: '/admin/tables' },
    { text: 'Usuários', icon: <PeopleIcon />, path: '/users' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/settings' },
  ];
  
  const finalMenuItems = user?.role === 'admin' ? [...menuItems, ...adminMenuItems] : menuItems;

  const drawer = (
    <div>
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
        <Typography variant="h6" noWrap component="div">{tenantInfo.name}</Typography>
        <Chip label={tenantInfo.is_open ? 'Loja Aberta' : 'Loja Fechada'} color={tenantInfo.is_open ? 'success' : 'error'} size="small" sx={{ mt: 0.5 }}/>
      </Toolbar>
      <Divider />
      <List>
        {finalMenuItems.map((item, index) => (
          item.isDivider ? <Divider key={`divider-${index}`} sx={{ my: 1 }} /> :
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">Olá, {user?.name}</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
        variant="permanent"
        anchor="left"
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;