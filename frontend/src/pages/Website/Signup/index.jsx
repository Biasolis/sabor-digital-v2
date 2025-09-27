import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Grid, TextField, Button, Box,
  CircularProgress, Alert, Divider,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import MercadoPagoForm from './components/MercadoPagoForm';

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    tenantName: '',
    subdomain: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const planId = searchParams.get('planId');
  const cycle = searchParams.get('cycle') || 'monthly';

  useEffect(() => {
    if (!planId) {
      setError('Nenhum plano selecionado. Por favor, volte e escolha um plano.');
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      try {
        const response = await api.get('/plans');
        const selectedPlan = response.data.find(p => p.id === planId);
        if (selectedPlan) {
          setPlan(selectedPlan);
        } else {
          setError('Plano não encontrado.');
        }
      } catch (err) {
        setError('Erro ao carregar detalhes do plano.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCardTokenReady = async (cardToken) => {
    setSubmitting(true);
    setError('');

    const payload = {
      ...formData,
      planId: plan.id,
      billingCycle: cycle,
      cardToken: cardToken,
    };
    
    try {
        await api.post('/subscriptions/signup', payload);
        toast.success('Parabéns! Seu restaurante foi criado com sucesso. Você já pode fazer login.');
        navigate('/login');

    } catch(err) {
        const msg = err.response?.data?.message || 'Ocorreu um erro ao processar sua assinatura.';
        setError(msg);
        toast.error(msg);
    } finally {
        setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // A função `onCardTokenReady` será chamada pelo componente do Mercado Pago
    // que por sua vez chamará `handleCardTokenReady` para enviar os dados
    const cardForm = window.MercadoPago.cardForm;
    cardForm.createCardToken();
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">Finalizar Assinatura</Typography>
        {error && !plan && <Alert severity="error">{error}</Alert>}
        
        {plan && (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Plano Selecionado</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="h5">{plan.name}</Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(cycle === 'monthly' ? plan.price_monthly : plan.price_annually)}
                    <Typography component="span" color="text.secondary">/{cycle === 'monthly' ? 'mês' : 'ano'}</Typography>
                  </Typography>
                </Paper>
                
                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>Dados do Restaurante</Typography>
                <TextField name="tenantName" label="Nome do Restaurante" fullWidth required margin="normal" value={formData.tenantName} onChange={handleChange}/>
                <TextField name="subdomain" label="Subdomínio (ex: meurestaurante)" fullWidth required margin="normal" value={formData.subdomain} onChange={handleChange}/>
                
                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>Dados do Administrador</Typography>
                <TextField name="adminName" label="Seu Nome Completo" fullWidth required margin="normal" value={formData.adminName} onChange={handleChange}/>
                <TextField name="adminEmail" label="Seu Email de Acesso" type="email" fullWidth required margin="normal" value={formData.adminEmail} onChange={handleChange}/>
                <TextField name="adminPassword" label="Crie uma Senha" type="password" fullWidth required margin="normal" value={formData.adminPassword} onChange={handleChange}/>
              </Grid>

              <Grid item xs={12} md={6}>
                <MercadoPagoForm onCardTokenReady={handleCardTokenReady} />
                 {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? <CircularProgress size={24} /> : 'Finalizar e Pagar'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default SignupPage;