import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';

const AddProductModal = ({ open, onClose, onConfirm, product }) => {
  const [quantity, setQuantity] = useState('1');

  // Reseta a quantidade para 1 sempre que o modal abrir
  useEffect(() => {
    if (open) {
      setQuantity('1');
    }
  }, [open]);

  const handleConfirm = () => {
    const numQuantity = parseInt(quantity, 10);
    if (!isNaN(numQuantity) && numQuantity > 0) {
      onConfirm(product, numQuantity);
    } else {
      alert('Por favor, insira uma quantidade válida.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Adicionar Produto</DialogTitle>
      <DialogContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {product?.name}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="quantity"
          label="Quantidade"
          type="number"
          fullWidth
          variant="outlined"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
          InputProps={{ inputProps: { min: 1 } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductModal;