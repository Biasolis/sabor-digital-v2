import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Container, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, TextField, Button, Grid, Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import api from '../../services/api';

// Componente para o status do pedido
const StatusChip = ({ status }) => {
  const props = {
    pending: { label: 'Pendente', color: 'default' },
    in_progress: { label: 'Em Preparo', color: 'warning' },
    ready: { label: 'Pronto', color: 'info' },
    delivered: { label: 'Entregue', color: 'success' },
    paid: { label: 'Pago', color: 'success' },
    canceled: { label: 'Cancelado', color: 'error' },
  }[status] || { label: 'Desconhecido', color: 'default' };

  return <Chip label={props.label} color={props.color} size="small" />;
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
      startDate: '',
      endDate: ''
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders', { params: filters });
      setOrders(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar pedidos.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (e) => {
      setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const handleFilterSubmit = () => {
      fetchOrders();
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString) => new Date(dateString).toLocaleString('pt-BR');

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" sx={{ my: 4 }}>
        Gerenciamento de Pedidos
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              name="startDate"
              label="Data de Início"
              type="date"
              fullWidth
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              name="endDate"
              label="Data de Fim"
              type="date"
              fullWidth
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button fullWidth variant="contained" onClick={handleFilterSubmit}>Filtrar</Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Comanda</TableCell>
                  <TableCell>Mesa</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Valor Total</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow hover key={order.id}>
                    <TableCell>#{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.table_number || 'N/A'}</TableCell>
                    <TableCell>{`${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() || 'Não vinculado'}</TableCell>
                    <TableCell><StatusChip status={order.status} /></TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell align="right">{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Detalhes">
                        <IconButton onClick={() => navigate(`/order/${order.id}`)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default OrdersPage;