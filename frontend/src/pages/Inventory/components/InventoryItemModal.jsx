import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const InventoryItemModal = ({ open, onClose, onSave, item }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity_on_hand: '',
    unit_of_measure: 'unidade',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        quantity_on_hand: item.quantity_on_hand || '',
        unit_of_measure: item.unit_of_measure || 'unidade',
      });
    } else {
      setFormData({ name: '', quantity_on_hand: '', unit_of_measure: 'unidade' });
    }
  }, [item, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave({ ...formData, id: item?.id });
  };

  const units = ['unidade', 'kg', 'g', 'litro', 'ml'];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{item ? 'Editar Item' : 'Novo Item de Estoque'}</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" name="name" label="Nome do Item" fullWidth value={formData.name} onChange={handleChange} />
        <TextField margin="dense" name="quantity_on_hand" label="Quantidade Atual" type="number" fullWidth value={formData.quantity_on_hand} onChange={handleChange} />
        <FormControl fullWidth margin="dense">
          <InputLabel>Unidade de Medida</InputLabel>
          <Select name="unit_of_measure" value={formData.unit_of_measure} label="Unidade de Medida" onChange={handleChange}>
            {units.map((unit) => (
              <MenuItem key={unit} value={unit}>{unit}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryItemModal;