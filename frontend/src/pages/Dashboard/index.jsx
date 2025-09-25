import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Typography,
  Box,
  Container,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { toast } from 'react-toastify';
import api from '../../services/api';
import StatCard from './components/StatCard';
import SalesChart from './components/SalesChart'; // 1. Importar o novo componente de gráfico

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        const msg = err.response?.data?.message || "Erro ao carregar estatísticas.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Olá, {user?.name}! Aqui está um resumo do seu dia.
      </Typography>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vendas Totais Hoje"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={<PointOfSaleIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pedidos Realizados Hoje"
            value={stats?.totalOrders || 0}
            icon={<ReceiptLongIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ticket Médio"
            value={formatCurrency(stats?.averageTicket || 0)}
            icon={<RequestQuoteIcon />}
            color="text.primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pedidos em Aberto"
            value={stats?.openOrdersCount || 0}
            icon={<HourglassTopIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* 2. Seção do Gráfico */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {stats?.salesLast7Days && <SalesChart data={stats.salesLast7Days} />}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;