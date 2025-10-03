import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, CircularProgress, Alert, Paper, List,
  ListItem, ListItemText, Divider, Button, TextField, IconButton, Chip,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Ícone para vincular cliente
import { toast } from 'react-toastify';
import api from '../../services/api';
import PaymentModal from './components/PaymentModal';
import AddProductModal from './components/AddProductModal';
import LinkCustomerModal from './components/LinkCustomerModal'; // 1. Nova importação

const getStatusProps = (status) => {
  switch (status) {
    case 'pending': return { label: 'Pendente', color: 'default' };
    case 'in_progress': return { label: 'Em Preparo', color: 'warning' };
    case 'ready': return { label: 'Pronto', color: 'info' };
    case 'delivered': return { label: 'Entregue', color: 'success' };
    case 'paid': return { label: 'Pago', color: 'success' };
    case 'canceled': return { label: 'Cancelado', color: 'error' };
    default: return { label: 'Desconhecido', color: 'default' };
  }
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null); // Novo estado para dados do cliente
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [isLinkCustomerModalOpen, setLinkCustomerModalOpen] = useState(false); // 2. Novo estado para o modal
  const [productToAdd, setProductToAdd] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [orderResponse, productsResponse] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get('/products'),
      ]);
      setOrder(orderResponse.data);
      setProducts(productsResponse.data.filter(p => p.is_available));

      // Se a comanda tiver um customer_id, busca os dados dele
      if (orderResponse.data.customer_id) {
        const customerResponse = await api.get(`/customers/${orderResponse.data.customer_id}`);
        setCustomer(customerResponse.data);
      } else {
        setCustomer(null);
      }

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

  const handleAddProduct = (product) => {
    setProductToAdd(product);
    setAddProductModalOpen(true);
  };
  
  const handleConfirmAddProduct = async (product, quantity) => {
    try {
        await api.post(`/orders/${orderId}/items`, {
            product_id: product.id,
            quantity: quantity
        });
        toast.success(`${quantity}x ${product.name} adicionado(s) à comanda.`);
        await fetchData();
    } catch(err) {
        toast.error(err.response?.data?.message || 'Erro ao adicionar item.');
    } finally {
        setAddProductModalOpen(false);
        setProductToAdd(null);
    }
  };
  
  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Tem certeza que deseja remover este item da comanda?')) {
        try {
            await api.delete(`/orders/${orderId}/items/${itemId}`);
            toast.warn('Item removido da comanda.');
            await fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao remover item.');
        }
    }
  };

  const handleUpdateStatus = async (status) => {
    const messages = {
      in_progress: 'Pedido enviado para a cozinha!',
      delivered: 'Pedido marcado como entregue!'
    }
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.info(messages[status] || 'Status atualizado!');
      await fetchData();
    } catch (error) {
       toast.error(error.response?.data?.message || `Erro ao atualizar status.`);
    }
  };
  
  // 3. Nova função para vincular o cliente
  const handleLinkCustomer = async (customerId) => {
    try {
      await api.post(`/orders/${orderId}/customer`, { customer_id: customerId });
      toast.success('Cliente vinculado com sucesso!');
      setLinkCustomerModalOpen(false);
      fetchData(); // Atualiza os dados para exibir o nome do cliente
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao vincular cliente.');
    }
  };

  const handlePayment = async (paymentMethod, tipAmount) => {
    setPaymentModalOpen(false);
    try {
      await api.patch(`/orders/${orderId}/status`, { 
        status: 'paid',
        payment_method: paymentMethod,
        tip_amount: tipAmount
      });
      toast.success('Conta fechada e pagamento registrado!');
      navigate(`/receipt/${orderId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao processar pagamento.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const statusProps = getStatusProps(order?.status);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Container maxWidth="md"><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Comanda da Mesa {order?.table_number}</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
            <Typography variant="subtitle1" color="text.secondary">ID: {order?.id.substring(0, 8)}</Typography>
            <Chip label={statusProps.label} color={statusProps.color} size="small" />
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/pdv')}>Voltar ao PDV</Button>
      </Box>

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
                 {/* 4. Box para exibir o cliente vinculado */}
                 <Box sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5', borderRadius: 1 }}>
                    {customer ? (
                      <Box>
                        <Typography variant="overline" color="text.secondary">Cliente</Typography>
                        <Typography variant="body1" fontWeight="bold">{`${customer.first_name} ${customer.last_name || ''}`}</Typography>
                      </Box>
                    ) : (
                      <Typography color="text.secondary">Nenhum cliente vinculado.</Typography>
                    )}
                    <Button startIcon={<PersonAddIcon />} onClick={() => setLinkCustomerModalOpen(true)}>
                      {customer ? 'Alterar' : 'Vincular Cliente'}
                    </Button>
                 </Box>

                 <List sx={{ minHeight: '40vh' }}>
                    {order?.items.map((item, index) => (
                        <React.Fragment key={item.id || index}>
                            <ListItem
                                secondaryAction={<IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.id)}><DeleteIcon /></IconButton>}
                            >
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
                    <Button variant="outlined" color="secondary" onClick={() => handleUpdateStatus('in_progress')} disabled={order?.items.length === 0}>
                        {order?.status === 'pending' ? 'Enviar para Cozinha' : 'Atualizar Cozinha'}
                    </Button>
                    {order?.status === 'ready' && (<Button variant="contained" color="info" startIcon={<CheckCircleIcon />} onClick={() => handleUpdateStatus('delivered')}>Marcar como Entregue</Button>)}
                    <Button variant="contained" color="success" onClick={() => setPaymentModalOpen(true)}>Fechar Conta</Button>
                 </Box>
            </Paper>
        </Grid>
      </Grid>
      
      <PaymentModal open={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} onConfirm={handlePayment} totalAmount={order?.total_amount || 0}/>
      <AddProductModal open={isAddProductModalOpen} onClose={() => setAddProductModalOpen(false)} onConfirm={handleConfirmAddProduct} product={productToAdd}/>
      {/* 5. Renderizar o novo modal */}
      <LinkCustomerModal open={isLinkCustomerModalOpen} onClose={() => setLinkCustomerModalOpen(false)} onCustomerLink={handleLinkCustomer} orderId={orderId}/>
    </Container>
  );
};

export default OrderDetailPage;