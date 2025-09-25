import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box,
  FormControl, InputLabel, Select, MenuItem, Divider, Typography
} from '@mui/material';

const TenantModal = ({ open, onClose, onSave, tenant, plans = [] }) => {
  const isEditing = !!tenant;
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (open) {
      if (isEditing) {
        setFormData({
          name: tenant.name || '',
          subdomain: tenant.subdomain || '',
          status: tenant.status || 'active',
          plan_id: tenant.plan_id || '',
          ticketz_api_url: tenant.ticketz_api_url || '',
          ticketz_api_token: tenant.ticketz_api_token || '',
        });
      } else {
        setFormData({
          name: '', subdomain: '', plan_id: '', status: 'active',
          admin_name: '', admin_email: '', admin_password: '',
          ticketz_api_url: '', ticketz_api_token: '',
        });
      }
    }
  }, [tenant, open, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({ ...formData, id: tenant?.id });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Cliente (Tenant)' : 'Criar Novo Cliente (Tenant)'}</DialogTitle>
      <DialogContent>
        <Box component="div" sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            name="name"
            label="Nome do Restaurante"
            value={formData.name || ''}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="subdomain"
            label="Subdomínio (ex: calabria)"
            value={formData.subdomain || ''}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="plan-select-label">Plano</InputLabel>
            <Select
              labelId="plan-select-label"
              name="plan_id"
              value={formData.plan_id || ''}
              label="Plano"
              onChange={handleChange}
            >
              {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              name="status"
              value={formData.status || ''}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="inactive">Inativo</MenuItem>
              <MenuItem value="suspended">Suspenso</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{my: 2}}><Typography>Integração Ticket-z</Typography></Divider>
          <TextField
            fullWidth
            margin="normal"
            name="ticketz_api_url"
            label="URL da API Ticket-z"
            value={formData.ticketz_api_url || ''}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="ticketz_api_token"
            label="Token da API Ticket-z"
            type="password"
            value={formData.ticketz_api_token || ''}
            onChange={handleChange}
          />
          
          {!isEditing && (
            <>
              <Divider sx={{my: 2}}><Typography>Administrador da Loja</Typography></Divider>
              <TextField
                fullWidth
                margin="normal"
                name="admin_name"
                label="Nome do Administrador"
                value={formData.admin_name || ''}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                name="admin_email"
                label="Email do Administrador"
                type="email"
                value={formData.admin_email || ''}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                name="admin_password"
                label="Senha Provisória do Admin"
                type="password"
                value={formData.admin_password || ''}
                onChange={handleChange}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Salvar Cliente</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TenantModal;