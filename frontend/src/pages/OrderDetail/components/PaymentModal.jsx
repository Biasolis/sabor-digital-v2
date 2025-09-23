import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
} from '@mui/material';

const PaymentModal = ({ open, onClose, onConfirm, totalAmount }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' é o valor padrão

  const handleConfirm = () => {
    onConfirm(paymentMethod);
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  // Lista de métodos de pagamento disponíveis no ENUM do banco de dados
  const paymentMethods = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'pix', label: 'PIX' },
    { value: 'other', label: 'Outro' },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Finalizar Pagamento</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2, textAlign: 'center' }}>
          <Typography variant="h6">Total a Pagar:</Typography>
          <Typography variant="h4" color="primary" fontWeight="bold">
            {formatCurrency(totalAmount)}
          </Typography>
        </Box>
        <FormControl fullWidth margin="normal">
          <InputLabel id="payment-method-label">Método de Pagamento</InputLabel>
          <Select
            labelId="payment-method-label"
            value={paymentMethod}
            label="Método de Pagamento"
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method.value} value={method.value}>
                {method.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="success">
          Confirmar Pagamento
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;