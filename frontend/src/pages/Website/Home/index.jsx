import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          my: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          A plataforma completa para o seu restaurante
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Gerencie seu cardápio, pedidos, mesas, estoque e finanças em um só lugar. Digitalize seu atendimento e impulsione suas vendas.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ mt: 4 }}
          onClick={() => navigate('/planos')}
        >
          Conheça nossos planos
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;