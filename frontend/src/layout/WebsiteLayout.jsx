import React from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

const WebsiteLayout = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
          >
            Sabor Digital
          </Typography>
          <Button color="inherit" onClick={() => navigate('/planos')}>Planos</Button>
          <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
          <Button variant="contained" onClick={() => navigate('/planos')}>Assine Agora</Button>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ bgcolor: 'background.paper', p: 6 }} >
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <RouterLink color="inherit" to="/">
            Sabor Digital
          </RouterLink>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Box>
    </Box>
  );
};

export default WebsiteLayout;