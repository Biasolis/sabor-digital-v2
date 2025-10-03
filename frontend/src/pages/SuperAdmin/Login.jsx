import React, { useState } from 'react';
import { toast } from 'react-toastify';
// No futuro, teríamos um AuthContext específico para o SuperAdmin
import { useAuth } from '../../contexts/AuthContext';
import { Button, TextField, Container, Typography, Box, Paper } from '@mui/material';
import api from '../../services/api'; // Usaremos a API diretamente aqui

const SuperAdminLogin = () => {
  // NOTA: Reutilizando o AuthContext por simplicidade, o ideal seria ter um separado.
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Chamada direta para a API de login do superadmin
      const response = await api.post('/superadmin/login', { email, password });
      
      // Simulação de login usando o AuthContext do tenant por enquanto
      // Em um projeto final, o login de superadmin teria seu próprio estado e fluxo
      const { token, user } = response.data;
      localStorage.setItem('@SaborDigital:user', JSON.stringify(user));
      localStorage.setItem('@SaborDigital:token', token);
      api.defaults.headers.authorization = `Bearer ${token}`;
      
      window.location.href = '/superadmin/dashboard'; // Força o recarregamento para o novo contexto

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Painel Super Admin</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="email" label="Email" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth name="password" label="Senha" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SuperAdminLogin;