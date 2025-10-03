import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Paper, Grid, TextField, Button,
  CircularProgress, Alert, Divider,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const SuperAdminProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // A API /me já retorna os dados necessários
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    });
    setLoading(false);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    // Remove a senha do payload se estiver vazia
    const dataToSave = { ...formData };
    if (!dataToSave.password) {
      delete dataToSave.password;
    }

    try {
      await api.put('/superadmin/profile', dataToSave);
      toast.success('Perfil atualizado com sucesso!');
      if (dataToSave.password) {
        setFormData(prev => ({ ...prev, password: '' })); // Limpa o campo de senha
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao salvar o perfil.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  
  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ my: 4 }}>Meu Perfil</Typography>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}><Divider sx={{ my: 1 }}>Alterar Senha</Divider></Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nova Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              helperText="Deixe em branco para não alterar a senha."
            />
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          <Grid item xs={12} sx={{ textAlign: 'right', mt: 2 }}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? <CircularProgress size={24} /> : 'Salvar Alterações'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SuperAdminProfilePage;