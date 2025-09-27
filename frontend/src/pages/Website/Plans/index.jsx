import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, CircularProgress, Alert, Grid, Card,
  CardHeader, CardContent, CardActions, Button, Switch, FormControlLabel,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annually'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/plans');
        // Filtra apenas os planos públicos
        setPlans(response.data.filter(p => p.is_public));
      } catch (err) {
        const msg = err.response?.data?.message || 'Erro ao carregar planos.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    // Redireciona para a página de signup, passando o ID do plano e o ciclo de cobrança
    navigate(`/signup?planId=${plan.id}&cycle=${billingCycle}`);
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL'
  }).format(value);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" gutterBottom sx={{ my: 4 }}>
        Planos e Preços
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <FormControlLabel
          control={
            <Switch
              checked={billingCycle === 'annually'}
              onChange={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
            />
          }
          label="Pagar anualmente (economize 20%)"
        />
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item key={plan.id} xs={12} sm={6} md={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardHeader
                title={plan.name}
                titleTypographyProps={{ align: 'center' }}
                sx={{ bgcolor: 'grey.200' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mb: 2 }}>
                  <Typography variant="h4" component="h2">
                    {formatCurrency(billingCycle === 'monthly' ? plan.price_monthly : plan.price_annually)}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                  </Typography>
                </Box>
                <ul>
                  <Typography component="li">
                    {plan.features?.maxUsers || 'N/D'} usuários
                  </Typography>
                  <Typography component="li">
                    {plan.features?.enableReports ? 'Acesso a Relatórios' : 'Relatórios Básicos'}
                  </Typography>
                   <Typography component="li">
                    Suporte via E-mail
                  </Typography>
                </ul>
              </CardContent>
              <CardActions>
                <Button fullWidth variant="contained" onClick={() => handleSelectPlan(plan)}>
                  Selecionar Plano
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PlansPage;