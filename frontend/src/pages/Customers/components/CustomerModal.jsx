import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid,
  FormControlLabel, Switch, Typography, Divider
} from '@mui/material';

const CustomerModal = ({ open, onClose, onSave, customer }) => {
  const isEditing = !!customer;
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (open) {
      if (isEditing) {
        setFormData({
          first_name: customer.first_name || '',
          last_name: customer.last_name || '',
          cpf: customer.cpf || '',
          birth_date: customer.birth_date ? customer.birth_date.split('T')[0] : '', // Formata a data
          email: customer.email || '',
          phone: customer.phone || '',
          address_street: customer.address_street || '',
          address_number: customer.address_number || '',
          address_complement: customer.address_complement || '',
          address_neighborhood: customer.address_neighborhood || '',
          address_city: customer.address_city || '',
          address_state: customer.address_state || '',
          address_zip_code: customer.address_zip_code || '',
          accepts_email_marketing: customer.accepts_email_marketing || false,
          accepts_whatsapp_marketing: customer.accepts_whatsapp_marketing || false,
        });
      } else {
        // Reset para um novo cliente
        setFormData({
          first_name: '', last_name: '', cpf: '', birth_date: '', email: '', phone: '',
          address_street: '', address_number: '', address_complement: '', address_neighborhood: '',
          address_city: '', address_state: '', address_zip_code: '',
          accepts_email_marketing: false, accepts_whatsapp_marketing: false,
        });
      }
    }
  }, [customer, open, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    onSave({ ...formData, id: customer?.id });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
      <DialogContent>
        <Typography variant="h6" sx={{ mt: 2 }}>Informações Pessoais</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="first_name" label="Nome *" value={formData.first_name || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="last_name" label="Sobrenome" value={formData.last_name || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="cpf" label="CPF" value={formData.cpf || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="birth_date" label="Data de Nascimento" type="date" InputLabelProps={{ shrink: true }} value={formData.birth_date || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="email" label="E-mail" type="email" value={formData.email || ''} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="phone" label="Telefone (WhatsApp) *" value={formData.phone || ''} onChange={handleChange} /></Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }}><Typography>Endereço de Entrega</Typography></Divider>
        
        <Grid container spacing={2}>
            <Grid item xs={12} sm={8}><TextField fullWidth margin="dense" name="address_street" label="Rua / Avenida" value={formData.address_street || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth margin="dense" name="address_number" label="Número" value={formData.address_number || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="address_complement" label="Complemento" value={formData.address_complement || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="address_neighborhood" label="Bairro" value={formData.address_neighborhood || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="dense" name="address_city" label="Cidade" value={formData.address_city || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth margin="dense" name="address_state" label="Estado" value={formData.address_state || ''} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth margin="dense" name="address_zip_code" label="CEP" value={formData.address_zip_code || ''} onChange={handleChange} /></Grid>
        </Grid>

         <Divider sx={{ my: 3 }}><Typography>Marketing</Typography></Divider>
         <FormControlLabel control={<Switch checked={formData.accepts_email_marketing} onChange={handleChange} name="accepts_email_marketing" />} label="Aceita receber promoções por E-mail" />
         <FormControlLabel control={<Switch checked={formData.accepts_whatsapp_marketing} onChange={handleChange} name="accepts_whatsapp_marketing" />} label="Aceita receber promoções por WhatsApp" />

      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Salvar Cliente</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerModal;