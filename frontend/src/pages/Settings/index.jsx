import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    primary_color: '#000000',
    secondary_color: '#000000',
    is_open: true,
    ticketz_api_url: '',
    ticketz_api_token: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tenants/me')
      .then(response => {
        const { data } = response;
        setFormData({
          name: data.name || '',
          primary_color: data.primary_color || '#1976d2',
          secondary_color: data.secondary_color || '#9c27b0',
          is_open: data.is_open !== undefined ? data.is_open : true,
          ticketz_api_url: data.ticketz_api_url || '',
          ticketz_api_token: data.ticketz_api_token || '',
        });
        // Apenas define a URL da imagem vinda da API
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      })
      .catch(() => {
        toast.error('Erro ao carregar configurações.');
        setError('Não foi possível carregar as configurações da loja.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'switch' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      // CORREÇÃO: URL.createObjectURL é usado APENAS com o novo arquivo selecionado
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('primary_color', formData.primary_color);
    data.append('secondary_color', formData.secondary_color);
    data.append('is_open', formData.is_open);
    data.append('ticketz_api_url', formData.ticketz_api_url);
    data.append('ticketz_api_token', formData.ticketz_api_token);
    if (logoFile) {
      data.append('logo', logoFile);
    }

    try {
      await api.put('/tenants/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ my: 4 }}>Configurações da Loja</Typography>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={formData.is_open} onChange={handleInputChange} name="is_open" />}
              label={formData.is_open ? "Loja Aberta - Aceitando pedidos" : "Loja Fechada - Cardápio apenas para visualização"}
            />
          </Grid>
          <Grid item xs={12}><Divider /></Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Nome do Restaurante" name="name" value={formData.name} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="Cor Primária"
                name="primary_color"
                type="color"
                value={formData.primary_color}
                onChange={handleInputChange}
                sx={{ minWidth: '70px', p: 0, '& input': { height: '40px', padding: '4px' } }}
              />
              <TextField
                label="Código Hex"
                value={formData.primary_color}
                onChange={handleInputChange}
                name="primary_color"
                variant="outlined"
                fullWidth
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="Cor Secundária"
                name="secondary_color"
                type="color"
                value={formData.secondary_color}
                onChange={handleInputChange}
                sx={{ minWidth: '70px', p: 0, '& input': { height: '40px', padding: '4px' } }}
              />
              <TextField
                label="Código Hex"
                value={formData.secondary_color}
                onChange={handleInputChange}
                name="secondary_color"
                variant="outlined"
                fullWidth
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography color="text.secondary">Logo da Loja</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {logoPreview && <img src={logoPreview} alt="Logo Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '16px', borderRadius: '4px' }} />}
              <Button variant="outlined" component="label">
                Carregar Logo
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}><Divider sx={{ my: 2 }}><Typography>Integração com Ticket-z</Typography></Divider></Grid>
          
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="URL da API do Ticket-z" 
              name="ticketz_api_url" 
              value={formData.ticketz_api_url} 
              onChange={handleInputChange} 
              helperText="Exemplo: http://seu-ticketz.com"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="Token da API do Ticket-z" 
              name="ticketz_api_token" 
              value={formData.ticketz_api_token} 
              onChange={handleInputChange} 
              type="password"
              helperText="Seu token de acesso para enviar mensagens."
            />
          </Grid>

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

export default SettingsPage;