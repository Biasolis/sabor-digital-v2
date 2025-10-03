import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';
import api from '../../services/api';

// Componente para um único cartão de pedido
const OrderCard = ({ order, onMarkAsReady }) => {
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Mesa {order.table_number}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Pedido: #{order.id.substring(0, 5)}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '250px' }}>
        {order.items.map((item, index) => (
          <Typography key={index} variant="body1">
            {item.quantity}x {item.product_name}
          </Typography>
        ))}
      </Box>
      <Button
        variant="contained"
        color="success"
        fullWidth
        startIcon={<CheckCircleIcon />}
        onClick={() => onMarkAsReady(order.id)}
        sx={{ mt: 2 }}
      >
        Marcar como Pronto
      </Button>
    </Paper>
  );
};

const KitchenPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKitchenOrders = useCallback(async () => {
    // Não seta o loading em refetches para não piscar
    try {
      // Idealmente, o backend teria um endpoint /orders/kitchen?status=in_progress
      // Por enquanto, vamos filtrar no frontend
      const response = await api.get('/orders'); // Endpoint de listagem geral (a ser criado)
      
      // Filtra pedidos que estão em andamento e busca detalhes de cada um
      const inProgressOrders = response.data.filter(o => o.status === 'in_progress');
      
      const detailedOrders = await Promise.all(
        inProgressOrders.map(order => api.get(`/orders/${order.id}`).then(res => res.data))
      );
      
      setOrders(detailedOrders);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar pedidos da cozinha.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para buscar os dados inicialmente e depois a cada 15 segundos
  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 15000); // Atualiza a cada 15s
    return () => clearInterval(interval); // Limpa o intervalo ao sair da página
  }, [fetchKitchenOrders]);

  const handleMarkAsReady = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'ready' });
      toast.success(`Pedido #${orderId.substring(0, 5)} marcado como pronto!`);
      // Remove o pedido da lista sem precisar esperar o próximo fetch
      setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status do pedido.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1">
          Painel da Cozinha
        </Typography>
        <Typography color="text.secondary">
          Pedidos pendentes de preparo. A lista atualiza automaticamente.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {orders.length > 0 ? (
          orders.map((order) => (
            <Grid item key={order.id} xs={12} sm={6} md={4} lg={3}>
              <OrderCard order={order} onMarkAsReady={handleMarkAsReady} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 5, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum pedido pendente no momento.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default KitchenPage;