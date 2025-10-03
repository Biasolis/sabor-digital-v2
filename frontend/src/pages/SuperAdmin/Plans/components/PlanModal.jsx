import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  FormControlLabel, Switch, Grid, Typography, Divider
} from '@mui/material';

const PlanModal = ({ open, onClose, onSave, plan }) => {
  const isEditing = !!plan;
  const [formData, setFormData] = useState({
    name: '',
    price_monthly: '',
    price_annually: '',
    is_public: true,
    features: {
      maxUsers: 5,
      enableReports: false,
    }
  });

  useEffect(() => {
    if (open) {
      if (isEditing && plan) {
        setFormData({
          name: plan.name || '',
          price_monthly: plan.price_monthly || '',
          price_annually: plan.price_annually || '',
          is_public: plan.is_public !== undefined ? plan.is_public : true,
          features: {
            maxUsers: plan.features?.maxUsers || 5,
            enableReports: plan.features?.enableReports || false,
          }
        });
      } else {
        setFormData({
          name: '',
          price_monthly: '',
          price_annually: '',
          is_public: true,
          features: {
            maxUsers: 5,
            enableReports: false,
          }
        });
      }
    }
  }, [plan, open, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFeatureChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [name]: type === 'checkbox' ? checked : parseInt(value, 10) || 0,
      }
    }));
  };

  const handleSave = () => {
    onSave({ ...formData, id: plan?.id });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              name="name"
              label="Nome do Plano"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="price_monthly"
              label="Preço Mensal (ex: 49.90)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.price_monthly}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="price_annually"
              label="Preço Anual (ex: 499.90)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.price_annually}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_public}
                  onChange={handleChange}
                  name="is_public"
                />
              }
              label="Plano Visível Publicamente"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}><Typography>Funcionalidades do Plano</Typography></Divider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="maxUsers"
              label="Número Máximo de Usuários"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.features.maxUsers}
              onChange={handleFeatureChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.features.enableReports}
                  onChange={handleFeatureChange}
                  name="enableReports"
                />
              }
              label="Acesso aos Relatórios Gerenciais"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Salvar Plano</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanModal;