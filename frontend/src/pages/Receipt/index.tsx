import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress, Alert, Paper, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';

const ReceiptPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const tenant = JSON.parse(localStorage.getItem('@SaborDigital:tenant'));


    const fetchOrder = useCallback(async () => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            setOrder(response.data);
        } catch (error) {
            console.error("Erro ao buscar dados do pedido para impressão");
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);
    
    useEffect(() => {
        if(order){
            setTimeout(() => window.print(), 500);
        }
    }, [order]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (!order) return <Alert severity="error">Pedido não encontrado.</Alert>;

    return (
        <Container maxWidth="xs" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, '@media print': { display: 'none' } }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/pdv')}>Voltar ao PDV</Button>
                <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Imprimir</Button>
            </Box>
            <Paper elevation={0} variant="outlined" sx={{ p: 3, fontFamily: 'monospace' }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h5">{tenant?.name || 'Estabelecimento'}</Typography>
                    <Typography variant="caption" display="block">Mesa: {order.table_number} | Pedido: #{order.id.substring(0, 8)}</Typography>
                    <Typography variant="caption" display="block">{new Date(order.created_at).toLocaleString('pt-BR')}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', my:1 }}>CUPOM NÃO FISCAL</Typography>
                <Divider sx={{ my: 1 }} />
                <List dense>
                    {order.items.map((item, index) => (
                        <ListItem key={index} disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <ListItemText 
                                primary={`${item.quantity}x ${item.product_name}`} 
                                secondary={formatCurrency(item.unit_price)}
                            />
                            <Typography variant="body2">{formatCurrency(item.quantity * item.unit_price)}</Typography>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Subtotal:</Typography>
                    <Typography variant="body1">{formatCurrency(order.total_amount)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Taxa de Serviço:</Typography>
                    <Typography variant="body1">{formatCurrency(order.tip_amount)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">TOTAL:</Typography>
                    <Typography variant="h6">{formatCurrency(order.final_amount)}</Typography>
                </Box>
                 <Typography variant="caption" display="block" sx={{ textAlign: 'center', mt: 3 }}>
                    Obrigado pela preferência!
                 </Typography>
            </Paper>
        </Container>
    );
};

export default ReceiptPage;