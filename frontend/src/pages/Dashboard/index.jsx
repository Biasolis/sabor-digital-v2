import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Typography, Box } from '@mui/material';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Principal
      </Typography>
      <Typography variant="h6">
        Olá, {user?.name}! Você está logado.
      </Typography>
      <Typography>
        Seu e-mail: {user?.email}
      </Typography>
      <Typography>
        Sua função: {user?.role}
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="error" onClick={logout}>
          Sair (Logout)
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;