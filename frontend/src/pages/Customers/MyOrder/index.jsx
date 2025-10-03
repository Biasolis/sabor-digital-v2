import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Container, CircularProgress, Alert, Paper, List,
  ListItem, ListItemText, Divider, Button, Chip, AppBar, Toolbar
} from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const getStatusProps = (status) => {
  switch (status) {
    case 'pending': return { label: 'Pendente', color: 'default' };
    case 'in_progress': return { label: 'Em Preparo', color: 'warning' };
    case 'ready': return { label: 'Pronto', color: 'info' };
    case 'delivered': return { label: 'Entregue', color: 'success' };
    default: return { label: 'Desconhecido', color: 'default' };
  }
};

const MyOrderPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMyOrder = useCallback(async () => {
    setError('');
    try {
      const token = localStorage.getItem('@SaborDigital:customer_token');
      if (!token) throw new Error('Token não encontrado');

      const response = await api.get('/orders/my-active-order', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (err) {
      const msg = err.response?.status === 404
        ? 'Você ainda não possui uma comanda ativa.'
        : 'Erro ao buscar sua comanda.';
      setError(msg);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyOrder();
    // Atualiza a comanda a cada 30 segundos
    const interval = setInterval(fetchMyOrder, 30000);
    return () => clearInterval(interval);
  }, [fetchMyOrder]);
  
  const handleLogout = () => {
    localStorage.removeItem('@SaborDigital:customer_token');
    toast.info('Você foi desconectado.');
    navigate('/customer-login');
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  const statusProps = getStatusProps(order?.status);

  return (
    <Box sx={{ pb: 8 }}>
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Minha Comanda
                </Typography>
                <Button color="inherit" onClick={handleLogout}>Sair</Button>
            </Toolbar>
        </AppBar>

        <Container component="main" maxWidth="sm" sx={{ mt: 4 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
            ) : error ? (
                 <Alert severity="info">{error}</Alert>
            ) : order ? (
                <Paper elevation={3} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Mesa {order.table_number}</Typography>
                        <Chip label={statusProps.label} color={statusProps.color} />
                    </Box>
                    <Divider />
                    <List>
                        {order.items.map((item) => (
                            <ListItem key={item.id}>
                                <ListItemText 
                                    primary={`${item.quantity}x ${item.product_name}`}
                                    secondary={formatCurrency(item.unit_price)}
                                />
                                <Typography variant="body1" fontWeight="bold">
                                    {formatCurrency(item.quantity * item.unit_price)}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
                        <Typography variant="h5">Total:</Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                            {formatCurrency(order.total_amount)}
                        </Typography>
                    </Box>
                </Paper>
            ) : null}
        </Container>
    </Box>
  );
};

export default MyOrderPage;