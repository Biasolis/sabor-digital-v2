import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Container, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import TenantModal from '../components/TenantModal';

const SuperAdminDashboard = () => {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]); // Novo estado para armazenar os planos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      // Busca tenants e planos em paralelo
      const [tenantsResponse, plansResponse] = await Promise.all([
        api.get('/tenants'),
        api.get('/plans')
      ]);
      setTenants(tenantsResponse.data);
      setPlans(plansResponse.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar dados.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (tenant = null) => {
    setEditingTenant(tenant);
    setModalOpen(true);
  };

  const handleSaveTenant = async (tenantData) => {
    const isEditing = !!tenantData.id;
    const endpoint = isEditing ? `/tenants/${tenantData.id}` : '/tenants';
    const method = isEditing ? 'put' : 'post';
    
    try {
        await api[method](endpoint, tenantData);
        toast.success(`Cliente ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
        setModalOpen(false);
        fetchTenants();
    } catch (error) {
        toast.error(error.response?.data?.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} cliente.`);
    }
  };

  if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', mt: 5}}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">Clientes (Tenants)</Typography>
        <Box>
            <Button variant="outlined" sx={{mr: 2}} onClick={() => navigate('/superadmin/plans')}>
                Gerenciar Planos
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                Novo Cliente
            </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome do Restaurante</TableCell>
                <TableCell>Subdomínio</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow hover key={tenant.id}>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.subdomain}</TableCell>
                  <TableCell sx={{textTransform: 'capitalize'}}>{tenant.status}</TableCell>
                  <TableCell>{new Date(tenant.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar Cliente">
                      <IconButton onClick={() => handleOpenModal(tenant)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {tenants.length === 0 && !loading && (
            <Box sx={{p: 3, textAlign: 'center'}}>
                <Typography color="text.secondary">Nenhum cliente cadastrado.</Typography>
            </Box>
        )}
      </Paper>
      
      <TenantModal 
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTenant}
        tenant={editingTenant}
        plans={plans} // Passa a lista de planos para o modal
      />
    </Container>
  );
};

export default SuperAdminDashboard;