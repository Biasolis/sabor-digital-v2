import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  FormControl, InputLabel, Select, MenuItem, TextField, IconButton, List, ListItem, ListItemText, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const RecipeModal = ({ open, onClose, product, inventoryItems }) => {
  const [recipe, setRecipe] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (product) {
        setLoading(true);
        try {
          const response = await api.get(`/products/${product.id}/recipe`);
          setRecipe(response.data);
        } catch (error) {
          toast.error('Não foi possível carregar a ficha técnica.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchRecipe();
  }, [product, open]);

  const handleAddItem = () => {
    if (!selectedItem || !quantity) {
      toast.warn('Selecione um item e defina uma quantidade.');
      return;
    }
    const itemToAdd = inventoryItems.find(i => i.id === selectedItem);
    const newRecipeItem = {
      inventory_item_id: itemToAdd.id,
      name: itemToAdd.name,
      quantity_consumed: parseFloat(quantity),
      unit_of_measure: itemToAdd.unit_of_measure,
    };
    setRecipe([...recipe, newRecipeItem]);
    setSelectedItem('');
    setQuantity('');
  };

  const handleRemoveItem = (itemId) => {
    setRecipe(recipe.filter(item => item.inventory_item_id !== itemId));
  };
  
  const handleSaveRecipe = async () => {
    try {
        const recipeItemsToSave = recipe.map(item => ({
            inventory_item_id: item.inventory_item_id,
            quantity_consumed: item.quantity_consumed,
        }));

        await api.post(`/products/${product.id}/recipe`, { recipeItems: recipeItemsToSave });
        toast.success('Ficha técnica salva com sucesso!');
        onClose();
    } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao salvar a ficha técnica.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Ficha Técnica de: {product?.name}</DialogTitle>
      <DialogContent>
        {/* Seção para adicionar novos itens */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
          <FormControl sx={{ flex: 3 }}>
            <InputLabel>Item do Estoque</InputLabel>
            <Select value={selectedItem} label="Item do Estoque" onChange={(e) => setSelectedItem(e.target.value)}>
              {inventoryItems.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField sx={{ flex: 1 }} label="Quantidade" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Button variant="outlined" onClick={handleAddItem} startIcon={<AddCircleOutlineIcon />}>Adicionar</Button>
        </Box>
        <Divider />
        {/* Lista de itens na receita */}
        <Typography sx={{ mt: 2 }} color="text.secondary">Itens na Receita</Typography>
        <List>
          {loading ? <Typography>Carregando...</Typography> :
            recipe.map(item => (
              <ListItem key={item.inventory_item_id} secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveItem(item.inventory_item_id)}><DeleteIcon color="error" /></IconButton>
              }>
                <ListItemText 
                  primary={item.name} 
                  secondary={`Consumo: ${item.quantity_consumed} ${item.unit_of_measure}`} 
                />
              </ListItem>
            ))
          }
          {recipe.length === 0 && !loading && <Typography sx={{textAlign: 'center', p: 2}}>Nenhum item na ficha técnica.</Typography>}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSaveRecipe} variant="contained">Salvar Ficha Técnica</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeModal;