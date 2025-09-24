import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box,
  Typography, List, ListItem, ListItemText, CircularProgress, Alert
} from '@mui/material';
import api from '../../../services/api';

const LinkCustomerModal = ({ open, onClose, onCustomerLink, orderId }) => {
  const [cpf, setCpf] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!cpf) return;
    setLoading(true);
    setError('');
    setCustomer(null);
    try {
      // Futuramente, o ideal seria uma rota GET /customers?cpf=...
      // Por agora, vamos buscar todos e filtrar no frontend.
      const response = await api.get('/customers');
      const foundCustomer = response.data.find(c => c.cpf === cpf);
      
      if (foundCustomer) {
        setCustomer(foundCustomer);
      } else {
        setError('Nenhum cliente encontrado com este CPF.');
      }
    } catch (err) {
      setError('Erro ao buscar clientes.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLink = () => {
    if (customer) {
      onCustomerLink(customer.id);
    }
  };

  const handleClose = () => {
    // Reseta o estado ao fechar
    setCpf('');
    setCustomer(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Vincular Cliente à Comanda</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Digite o CPF do cliente para associá-lo a esta comanda.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            autoFocus
            fullWidth
            label="CPF do Cliente"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Buscar'}
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        
        {customer && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <Typography variant="subtitle1">Cliente Encontrado:</Typography>
            <Typography>{`${customer.first_name} ${customer.last_name || ''}`}</Typography>
            <Typography color="text.secondary">CPF: {customer.cpf}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleLink} variant="contained" disabled={!customer}>
          Vincular
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkCustomerModal;