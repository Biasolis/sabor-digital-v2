import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, CssBaseline, Divider, Chip, Button,
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

// Importação de todos os ícones necessários
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
import BadgeIcon from '@mui/icons-material/Badge';
import ListAltIcon from '@mui/icons-material/ListAlt';
import api from '../services/api';

const drawerWidth = 240;

// Objeto que define todos os itens de menu possíveis
const allMenuItems = {
  // Menus Operacionais
  dashboard: { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'caixa'] },
  pdv: { text: 'PDV', icon: <PointOfSaleIcon />, path: '/pdv', roles: ['admin', 'caixa', 'garcom'] },
  kitchen: { text: 'Cozinha', icon: <SoupKitchenIcon />, path: '/kitchen', roles: ['admin', 'cozinha'] },
  cashier: { text: 'Caixa', icon: <AttachMoneyIcon />, path: '/cashier', roles: ['admin', 'caixa'] },
  
  // Menus de Gerenciamento (Admin)
  divider: { isDivider: true, roles: ['admin'] },
  orders: { text: 'Pedidos', icon: <ListAltIcon />, path: '/orders', roles: ['admin', 'caixa'] },
  reports: { text: 'Relatórios', icon: <AssessmentIcon />, path: '/reports', roles: ['admin'] },
  menu: { text: 'Cardápio', icon: <RestaurantMenuIcon />, path: '/admin/menu', roles: ['admin'] },
  customers: { text: 'Clientes', icon: <BadgeIcon />, path: '/customers', roles: ['admin'] },
  inventory: { text: 'Estoque', icon: <InventoryIcon />, path: '/admin/inventory', roles: ['admin'] },
  tables: { text: 'Mesas', icon: <TableRestaurantIcon />, path: '/admin/tables', roles: ['admin'] },
  users: { text: 'Usuários', icon: <PeopleIcon />, path: '/users', roles: ['admin'] },
  settings: { text: 'Configurações', icon: <SettingsIcon />, path: '/settings', roles: ['admin'] },
};

// NOVO COMPONENTE: Banner para o modo de acesso
const ImpersonationBanner = () => {
    const { stopImpersonation } = useAuth();
    return (
        <AppBar position="fixed" color="warning" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar variant="dense" sx={{ justifyContent: 'center' }}>
                <Typography sx={{ mr: 2 }}>Você está acessando como cliente.</Typography>
                <Button 
                    color="inherit" 
                    variant="outlined" 
                    size="small" 
                    startIcon={<ExitToAppIcon />}
                    onClick={stopImpersonation}
                >
                    Retornar ao Super Admin
                </Button>
            </Toolbar>
        </AppBar>
    );
};


const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tenantInfo, setTenantInfo] = useState({ name: 'Carregando...', is_open: true });
  
  // Verifica se o token do superadmin existe para mostrar o banner
  const isImpersonating = !!localStorage.getItem('@SaborDigital:superadmin_token');

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

  // Filtra os itens de menu com base na função (role) do usuário logado
  const visibleMenuItems = Object.values(allMenuItems).filter(item => 
    item.roles.includes(user?.role)
  );

  const drawer = (
    <div>
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
        <Typography variant="h6" noWrap component="div">{tenantInfo.name}</Typography>
        <Chip label={tenantInfo.is_open ? 'Loja Aberta' : 'Loja Fechada'} color={tenantInfo.is_open ? 'success' : 'error'} size="small" sx={{ mt: 0.5 }}/>
      </Toolbar>
      <Divider />
      <List>
        {visibleMenuItems.map((item, index) => (
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
      {isImpersonating && <ImpersonationBanner />}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`,
          // Se estiver no modo de acesso, desloca a barra para baixo
          ...(isImpersonating && { mt: '48px' }),
        }}
      >
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
        {/* Adiciona um espaço extra no topo se o banner estiver visível */}
        {isImpersonating && <Toolbar variant="dense" />}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;