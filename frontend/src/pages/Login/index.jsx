import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext'; // Importa o hook useAuth

// Importando componentes do Material-UI
import { Button, TextField, Container, Typography, Box, Paper } from '@mui/material';

const Login = () => {
  const { login } = useAuth(); // Pega a função de login do contexto
  const [subdomain, setSubdomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!subdomain || !email || !password) {
      toast.error('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }
    
    // Chama a função de login do contexto
    await login({ subdomain, email, password });

    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sabor Digital V2
        </Typography>
        <Typography component="p" sx={{ mb: 3 }}>
          Acesse sua loja
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="subdomain"
            label="Subdomínio da Loja"
            name="subdomain"
            autoComplete="off"
            autoFocus
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;