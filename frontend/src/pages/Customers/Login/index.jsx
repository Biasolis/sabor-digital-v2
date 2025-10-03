import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box, Paper, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const CustomerLogin = () => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/customer/auth/login', { cpf, password });
      const { token, customer } = response.data;

      // Armazena o token do cliente separadamente do token do funcionário
      localStorage.setItem('@SaborDigital:customer_token', token);
      
      toast.success(`Bem-vindo, ${customer.name}!`);
      navigate('/my-order'); // Redireciona para a página da comanda

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Acessar Minha Comanda</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField margin="normal" required fullWidth id="cpf" label="Seu CPF" name="cpf" autoComplete="off" autoFocus value={cpf} onChange={(e) => setCpf(e.target.value)} />
          <TextField margin="normal" required fullWidth name="password" label="Senha" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <Box textAlign="center">
            <Typography variant="body2">
              Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
            </Typography>
             <Typography variant="body2" sx={{mt: 1}}>
              <Link to="/">Voltar ao cardápio</Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerLogin;