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

const CloseSessionModal = ({ open, onClose, onSave }) => {
  const [closingBalance, setClosingBalance] = useState('');

  const handleSave = () => {
    const balance = parseFloat(closingBalance);
    if (!isNaN(balance) && balance >= 0) {
      onSave(balance);
      setClosingBalance(''); // Limpa o campo
    } else {
      alert('Por favor, insira um valor de saldo final válido.');
    }
  };

  const handleClose = () => {
    setClosingBalance('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Fechar Sessão de Caixa</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Conte todo o dinheiro do caixa e insira o valor final para fechar a sessão.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="closing_balance"
          label="Saldo de Fechamento (R$)"
          type="number"
          fullWidth
          variant="outlined"
          value={closingBalance}
          onChange={(e) => setClosingBalance(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="error">
          Fechar Caixa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloseSessionModal;