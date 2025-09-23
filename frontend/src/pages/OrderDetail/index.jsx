import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  TextField,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { toast } from 'react-toastify';
import api from '../../services/api';

// Importa o novo modal de pagamento
import PaymentModal from './components/PaymentModal';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Não reseta o loading aqui para evitar piscar na tela ao adicionar itens
      const [orderResponse, productsResponse] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get('/products'),
      ]);
      setOrder(orderResponse.data);
      setProducts(productsResponse.data.filter(p => p.is_available)); // Mostra apenas produtos disponíveis
    } catch (err) {
      const msg = err.response?.data?.message || 'Falha ao carregar dados da comanda.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddProduct = async (product) => {
    const quantity = parseInt(prompt(`Adicionar "${product.name}".\n\nQuantidade:`, "1"), 10);
    
    if (quantity && !isNaN(quantity) && quantity > 0) {
        try {
            await api.post(`/orders/${orderId}/items`, {
                product_id: product.id,
                quantity: quantity
            });
            toast.success(`${quantity}x ${product.name} adicionado(s) à comanda.`);
            await fetchData(); // Recarrega os dados para mostrar o novo item
        } catch(err) {
            toast.error(err.response?.data?.message || 'Erro ao adicionar item.');
        }
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.info(`Pedido enviado para a cozinha!`);
      await fetchData();
    } catch (error) {
       toast.error(error.response?.data?.message || `Erro ao atualizar status.`);
    }
  };

  const handlePayment = async (paymentMethod) => {
    setPaymentModalOpen(false);
    try {
      await api.patch(`/orders/${orderId}/status`, { 
        status: 'paid',
        payment_method: paymentMethod 
      });
      toast.success('Conta fechada e pagamento registrado com sucesso!');
      navigate('/pdv'); // Redireciona de volta para a tela de mesas
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao processar pagamento.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Comanda da Mesa {order?.table_number}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        ID da Comanda: {order?.id.substring(0, 8)}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Typography variant="h6" gutterBottom>Adicionar Produtos</Typography>
          <Paper elevation={2}>
            <Box sx={{ p: 2 }}><TextField fullWidth label="Buscar produto..." variant="outlined" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></Box>
            <List sx={{ height: '60vh', overflowY: 'auto' }}>
              {filteredProducts.map(product => (
                <ListItem key={product.id} secondaryAction={
                    <Button variant="outlined" size="small" startIcon={<AddShoppingCartIcon />} onClick={() => handleAddProduct(product)}>Adicionar</Button>
                } >
                  <ListItemText primary={product.name} secondary={formatCurrency(product.price)} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
           <Typography variant="h6" gutterBottom>Itens na Comanda</Typography>
            <Paper elevation={2} sx={{ p: 2 }}>
                 <List sx={{ minHeight: '40vh' }}>
                    {order?.items.map((item, index) => (
                        <React.Fragment key={index}>
                            <ListItem>
                                <ListItemText primary={`${item.quantity}x ${item.product_name}`} secondary={formatCurrency(item.unit_price)} />
                                <Typography variant="body1" fontWeight="bold">{formatCurrency(item.quantity * item.unit_price)}</Typography>
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                    {order?.items.length === 0 && (<Typography sx={{p: 2, textAlign: 'center', color: 'text.secondary'}}>Nenhum item adicionado ainda.</Typography>)}
                 </List>
                 <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                    <Typography variant="h5">Total:</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">{formatCurrency(order?.total_amount)}</Typography>
                 </Box>
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2}}>
                    <Button variant="outlined" color="secondary" onClick={() => handleUpdateStatus('in_progress')}>Enviar para Cozinha</Button>
                    <Button variant="contained" color="success" onClick={() => setPaymentModalOpen(true)}>Fechar Conta</Button>
                 </Box>
            </Paper>
        </Grid>
      </Grid>
      
      {/* Modal de Pagamento */}
      <PaymentModal 
        open={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onConfirm={handlePayment}
        totalAmount={order?.total_amount || 0}
      />
    </Container>
  );
};

export default OrderDetailPage;