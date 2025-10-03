import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  DialogContentText,
} from '@mui/material';

const OpenSessionModal = ({ open, onClose, onSave }) => {
  const [openingBalance, setOpeningBalance] = useState('');

  const handleSave = () => {
    const balance = parseFloat(openingBalance);
    if (!isNaN(balance) && balance >= 0) {
      onSave(balance);
      setOpeningBalance(''); // Limpa o campo
    } else {
      alert('Por favor, insira um valor de saldo inicial válido.');
    }
  };

  const handleClose = () => {
    setOpeningBalance('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Abrir Sessão de Caixa</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Insira o valor inicial em dinheiro (suprimento) para começar a operar este caixa.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="opening_balance"
          label="Saldo Inicial (R$)"
          type="number"
          fullWidth
          variant="outlined"
          value={openingBalance}
          onChange={(e) => setOpeningBalance(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Abrir Caixa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpenSessionModal;