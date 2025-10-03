import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Container, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import api from '../../services/api';
import InventoryItemModal from './components/InventoryItemModal';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventory');
      setItems(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar estoque.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSaveItem = async (itemData) => {
    const isEditing = !!itemData.id;
    const endpoint = isEditing ? `/inventory/${itemData.id}` : '/inventory';
    const method = isEditing ? 'put' : 'post';

    try {
      await api[method](endpoint, itemData);
      toast.success(`Item ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      setModalOpen(false);
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar item.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Tem certeza que deseja excluir este item do estoque?')) {
      try {
        await api.delete(`/inventory/${itemId}`);
        toast.success('Item excluído com sucesso!');
        fetchItems();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir item.');
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">Gerenciamento de Estoque</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Novo Item</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome do Item</TableCell>
                <TableCell align="right">Quantidade em Estoque</TableCell>
                <TableCell>Unidade</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity_on_hand}</TableCell>
                  <TableCell>{item.unit_of_measure}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar"><IconButton onClick={() => handleOpenModal(item)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Excluir"><IconButton onClick={() => handleDeleteItem(item.id)}><DeleteIcon color="error" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <InventoryItemModal open={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveItem} item={editingItem} />
    </Container>
  );
};

export default InventoryPage;