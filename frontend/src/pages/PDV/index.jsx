import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  ButtonBase,
} from '@mui/material';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TableCard = ({ table, onClick }) => (
  <ButtonBase
    onClick={() => onClick(table)}
    sx={{
      width: '100%',
      borderRadius: 2,
      '&:hover': {
        boxShadow: 6,
      },
    }}
  >
    <Paper
      elevation={2}
      sx={{
        p: 2,
        width: '100%',
        textAlign: 'center',
        border: 2,
        borderColor: 'transparent',
        ...(table.status === 'occupied' && {
          borderColor: 'warning.main',
          backgroundColor: 'warning.light',
        }),
        ...(table.status === 'available' && {
          borderColor: 'success.main',
          backgroundColor: 'success.light',
        }),
      }}
    >
      <TableRestaurantIcon sx={{ fontSize: 50 }} />
      <Typography variant="h6" component="div">
        Mesa {table.number}
      </Typography>
      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
        {table.status === 'available' ? 'Disponível' : 'Ocupada'}
      </Typography>
    </Paper>
  </ButtonBase>
);

const PDVPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const handleTableClick = async (table) => {
    if (table.status === 'available') {
      if (window.confirm(`Deseja abrir uma nova comanda para a Mesa ${table.number}?`)) {
        try {
          const response = await api.post('/orders', { table_id: table.id });
          const newOrder = response.data;
          toast.success(`Comanda #${newOrder.id.substring(0, 5)} aberta para a Mesa ${table.number}`);
          // MODIFICADO: Navega para a tela de detalhes do pedido
          navigate(`/order/${newOrder.id}`);
        } catch (error) {
          toast.error(error.response?.data?.message || 'Não foi possível abrir a comanda.');
        }
      }
    } else {
      toast.info(`Mesa ${table.number} já está ocupada. Funcionalidade de visualizar comanda em desenvolvimento.`);
      // No futuro, aqui buscaremos a comanda existente para esta mesa
      // const order = await findOpenOrderForTable(table.id);
      // navigate(`/order/${order.id}`);
    }
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ponto de Venda (PDV) - Visão Geral
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Selecione uma mesa para iniciar um novo pedido ou gerenciar um existente.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {tables.map((table) => (
          <Grid item key={table.id} xs={12} sm={6} md={4} lg={3} xl={2}>
            <TableCard table={table} onClick={handleTableClick} />
          </Grid>
        ))}

        {tables.length === 0 && !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Nenhuma mesa cadastrada. Vá para a tela de 'Gerenciamento de Mesas' para começar.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default PDVPage;