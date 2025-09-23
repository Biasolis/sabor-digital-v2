import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import { toast } from 'react-toastify';
import api from '../../services/api';
import TableModal from './components/TableModal'; // Importa o novo modal

const TablePage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar as mesas.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);
  
  // Função chamada pelo modal ao salvar
  const handleSaveTable = async (tableNumber) => {
    try {
      await api.post('/tables', { number: tableNumber });
      toast.success(`Mesa ${tableNumber} adicionada com sucesso!`);
      setIsModalOpen(false); // Fecha o modal
      fetchTables(); // Recarrega a lista de mesas
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar a mesa.');
    }
  };


  const handleDeleteTable = async (table) => {
    if (window.confirm(`Tem certeza que deseja excluir a Mesa ${table.number}?`)) {
      try {
        await api.delete(`/tables/${table.id}`);
        toast.success(`Mesa ${table.number} excluída com sucesso!`);
        fetchTables();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir a mesa.');
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">
          Gerenciamento de Mesas
        </Typography>
        {/* O botão agora abre o modal */}
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>
          Adicionar Mesa
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {tables.map((table) => (
          <Grid item key={table.id} xs={12} sm={6} md={4} lg={3}>
            <Paper 
              elevation={2} 
              sx={{ p: 2, textAlign: 'center', position: 'relative', 
                   backgroundColor: table.status === 'occupied' ? 'warning.light' : 'background.paper'
              }}
            >
              <TableRestaurantIcon sx={{ fontSize: 60 }} color="action" />
              <Typography variant="h5" sx={{ mt: 1 }}>
                Mesa {table.number}
              </Typography>
               <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {table.status === 'available' ? 'Disponível' : 'Ocupada'}
              </Typography>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <Tooltip title="Excluir Mesa">
                  <IconButton size="small" onClick={() => handleDeleteTable(table)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Grid>
        ))}
         {tables.length === 0 && !loading && (
            <Grid item xs={12}>
                <Paper sx={{p: 3, textAlign: 'center'}}>
                    <Typography color="text.secondary">Nenhuma mesa cadastrada.</Typography>
                </Paper>
            </Grid>
        )}
      </Grid>
      
      {/* Renderiza o componente do modal */}
      <TableModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTable}
      />
    </Container>
  );
};

export default TablePage;