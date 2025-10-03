import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box, Paper, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/customer/auth/register', {
        first_name: formData.first_name,
        cpf: formData.cpf,
        phone: formData.phone,
        password: formData.password
      });
      
      toast.success('Cadastro realizado com sucesso! Agora você pode fazer login.');
      navigate('/customer-login');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao realizar cadastro.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Crie sua Conta</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField margin="normal" required fullWidth label="Nome" name="first_name" value={formData.first_name} onChange={handleChange} autoFocus />
          <TextField margin="normal" required fullWidth label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} />
          <TextField margin="normal" required fullWidth label="Telefone (WhatsApp)" name="phone" value={formData.phone} onChange={handleChange} />
          <TextField margin="normal" required fullWidth name="password" label="Senha" type="password" value={formData.password} onChange={handleChange} />
          <TextField margin="normal" required fullWidth name="confirmPassword" label="Confirme a Senha" type="password" value={formData.confirmPassword} onChange={handleChange} />

          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
          <Box textAlign="center">
            <Typography variant="body2">
              Já tem uma conta? <Link to="/customer-login">Faça login</Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerRegister;