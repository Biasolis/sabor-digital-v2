import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Container, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import PlanModal from './components/PlanModal';

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const navigate = useNavigate();

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/plans');
      setPlans(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar planos.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenModal = (plan = null) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSavePlan = async (planData) => {
    const isEditing = !!planData.id;
    const method = isEditing ? 'put' : 'post';
    const endpoint = isEditing ? `/plans/${planData.id}` : '/plans';

    try {
        await api[method](endpoint, planData);
        toast.success(`Plano ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
        setIsModalOpen(false);
        fetchPlans();
    } catch (error) {
        toast.error(error.response?.data?.message || `Erro ao salvar plano.`);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.')) {
        try {
            await api.delete(`/plans/${planId}`);
            toast.success('Plano excluído com sucesso!');
            fetchPlans();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erro ao excluir plano.');
        }
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL'
  }).format(value);

  if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', mt: 5}}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">Gerenciamento de Planos</Typography>
        <Box>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} sx={{mr: 2}} onClick={() => navigate('/superadmin/dashboard')}>
                Voltar
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                Novo Plano
            </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome do Plano</TableCell>
                <TableCell align="right">Preço Mensal</TableCell>
                <TableCell>Público</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans.map((plan) => (
                <TableRow hover key={plan.id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell align="right">{formatCurrency(plan.price)}</TableCell>
                  <TableCell>{plan.is_public ? 'Sim' : 'Não'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar Plano"><IconButton onClick={() => handleOpenModal(plan)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Excluir Plano"><IconButton onClick={() => handleDeletePlan(plan.id)}><DeleteIcon color="error" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
         {plans.length === 0 && !loading && (
            <Box sx={{p: 3, textAlign: 'center'}}>
                <Typography color="text.secondary">Nenhum plano cadastrado.</Typography>
            </Box>
        )}
      </Paper>

      <PlanModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlan}
        plan={editingPlan}
      />
    </Container>
  );
};

export default PlansPage;