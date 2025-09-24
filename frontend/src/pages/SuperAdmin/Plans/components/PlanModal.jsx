import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  FormControlLabel, Switch
} from '@mui/material';

const PlanModal = ({ open, onClose, onSave, plan }) => {
  const isEditing = !!plan;
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    is_public: true,
  });

  useEffect(() => {
    if (open) {
      if (isEditing) {
        setFormData({
          name: plan.name || '',
          price: plan.price || '',
          is_public: plan.is_public !== undefined ? plan.is_public : true,
        });
      } else {
        setFormData({ name: '', price: '', is_public: true });
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

  const handleSave = () => {
    onSave({ ...formData, id: plan?.id });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Nome do Plano"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="price"
          label="Preço Mensal (ex: 49.90)"
          type="number"
          fullWidth
          variant="outlined"
          value={formData.price}
          onChange={handleChange}
        />
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_public}
              onChange={handleChange}
              name="is_public"
            />
          }
          label="Plano Visível Publicamente"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Salvar Plano</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanModal;