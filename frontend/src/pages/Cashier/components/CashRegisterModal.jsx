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

const CashRegisterModal = ({ open, onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name);
      setName(''); // Limpa o campo após salvar
    } else {
      alert('Por favor, insira um nome para o caixa.');
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Cadastrar Novo Caixa</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Dê um nome para identificar este ponto de venda (ex: Caixa Principal, Bar).
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Nome do Caixa"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CashRegisterModal;