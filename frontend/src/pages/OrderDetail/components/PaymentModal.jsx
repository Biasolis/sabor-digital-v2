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
  Switch,
  FormControlLabel,
} from '@mui/material';

const PaymentModal = ({ open, onClose, onConfirm, totalAmount }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [addTip, setAddTip] = useState(true);

  // CORREÇÃO: Garante que os valores são tratados como números
  const numericTotalAmount = parseFloat(totalAmount) || 0;
  const tipAmount = addTip ? numericTotalAmount * 0.10 : 0;
  const finalAmount = numericTotalAmount + tipAmount;

  const handleConfirm = () => {
    onConfirm(paymentMethod, tipAmount); // Envia o valor da gorjeta
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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
          <Typography variant="body2">Subtotal: {formatCurrency(numericTotalAmount)}</Typography>
          <Typography variant="body2">Taxa de Serviço: {formatCurrency(tipAmount)}</Typography>
          <Typography variant="h4" color="primary" fontWeight="bold">
            Total: {formatCurrency(finalAmount)}
          </Typography>
        </Box>
        <FormControlLabel
          control={<Switch checked={addTip} onChange={(e) => setAddTip(e.target.checked)} />}
          label="Adicionar 10% do garçom"
          sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="payment-method-label">Método de Pagamento</InputLabel>
          <Select
            labelId="payment-method-label"
            value={paymentMethod}
            label="Método de Pagamento"
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {paymentMethods.map((method) => <MenuItem key={method.value} value={method.value}>{method.label}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button onClick={onClose} sx={{mr: 1}}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="success">
          Confirmar Pagamento
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;