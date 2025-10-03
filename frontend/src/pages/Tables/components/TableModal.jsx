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

const TableModal = ({ open, onClose, onSave }) => {
  const [tableNumber, setTableNumber] = useState('');

  const handleSave = () => {
    if (tableNumber && !isNaN(tableNumber)) {
      onSave(parseInt(tableNumber, 10));
      setTableNumber(''); // Limpa o campo após salvar
    }
  };

  const handleClose = () => {
    setTableNumber(''); // Limpa o campo ao fechar
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Adicionar Nova Mesa</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Por favor, insira o número para a nova mesa que deseja cadastrar.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="number"
          label="Número da Mesa"
          type="number"
          fullWidth
          variant="outlined"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
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

export default TableModal;