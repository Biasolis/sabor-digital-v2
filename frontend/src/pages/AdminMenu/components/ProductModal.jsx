import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
  Box, Typography, Grid,
} from '@mui/material';

const placeholderImage = 'https://via.placeholder.com/300x200.png?text=Selecione+uma+imagem';

const ProductModal = ({ open, onClose, onSave, product, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
    barcode: '', // Novo campo
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(placeholderImage);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category_id: categories.find(c => c.name === product.category_name)?.id || '',
        is_available: product.is_available !== undefined ? product.is_available : true,
        barcode: product.barcode || '', // Novo campo
      });
      setImagePreview(product.image_url || placeholderImage);
    } else {
      setFormData({
        name: '', description: '', price: '', category_id: '',
        is_available: true, barcode: '', // Novo campo
      });
      setImagePreview(placeholderImage);
    }
    setImageFile(null);
  }, [product, categories, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    const dataToSave = product ? { ...formData, id: product.id } : formData;
    onSave(dataToSave, imageFile);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={7}>
            <TextField autoFocus margin="dense" name="name" label="Nome do Produto" fullWidth value={formData.name} onChange={handleChange} />
            <TextField margin="dense" name="description" label="Descrição" multiline rows={3} fullWidth value={formData.description} onChange={handleChange} />
            <Grid container spacing={2}>
                <Grid item xs={6}><TextField margin="dense" name="price" label="Preço (ex: 19.90)" type="number" fullWidth value={formData.price} onChange={handleChange} /></Grid>
                <Grid item xs={6}><TextField margin="dense" name="barcode" label="Código de Barras" fullWidth value={formData.barcode} onChange={handleChange} /></Grid>
            </Grid>
            <FormControl fullWidth margin="dense">
              <InputLabel id="category-select-label">Categoria</InputLabel>
              <Select labelId="category-select-label" name="category_id" value={formData.category_id} label="Categoria" onChange={handleChange}>
                {categories.map((cat) => (<MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>))}
              </Select>
            </FormControl>
            <FormControlLabel control={<Switch checked={formData.is_available} onChange={handleChange} name="is_available"/>} label="Disponível para venda" />
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" color="text.secondary">Imagem do Produto</Typography>
            <Box component="img" src={imagePreview} alt="Preview" sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 1, border: '1px solid #ccc', mt: 1 }}/>
            <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
              Selecionar Imagem
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Salvar Produto</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;