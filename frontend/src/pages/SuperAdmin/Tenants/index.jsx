import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Container, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoginIcon from '@mui/icons-material/Login'; // 1. Ícone para o botão de acesso
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import TenantModal from '../components/TenantModal';

const TenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
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
        fetchData();
    } catch (error) {
        toast.error(error.response?.data?.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} cliente.`);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete(`/tenants/${tenantId}`);
        toast.success('Cliente excluído com sucesso!');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir cliente.');
      }
    }
  };

  // 2. NOVA FUNÇÃO para acessar o painel do tenant
  const handleImpersonate = async (tenant) => {
    if (window.confirm(`Deseja acessar o painel de "${tenant.name}"? Você será desconectado da sua sessão de Super Admin temporariamente.`)) {
      try {
        const { data } = await api.post(`/superadmin/impersonate/${tenant.id}`);
        
        // Guarda o token original do Super Admin
        const superAdminToken = localStorage.getItem('@SaborDigital:token');
        localStorage.setItem('@SaborDigital:superadmin_token', superAdminToken);

        // Define os novos dados de acesso (do admin do tenant)
        localStorage.setItem('@SaborDigital:user', JSON.stringify(data.user));
        localStorage.setItem('@SaborDigital:token', data.token);
        localStorage.setItem('@SaborDigital:tenant', JSON.stringify(data.tenant));

        // Atualiza o header da API para o novo token
        api.defaults.headers.authorization = `Bearer ${data.token}`;
        
        toast.success(data.message);

        // Abre o dashboard do tenant em uma nova aba
        window.open(`http://${tenant.subdomain}.localhost:5173/dashboard`, '_blank');

      } catch (error) {
        toast.error(error.response?.data?.message || 'Não foi possível acessar o painel do cliente.');
      }
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
                <TableCell>Plano</TableCell>
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
                  <TableCell>{plans.find(p => p.id === tenant.plan_id)?.name || 'N/A'}</TableCell>
                  <TableCell sx={{textTransform: 'capitalize'}}>{tenant.status}</TableCell>
                  <TableCell>{new Date(tenant.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell align="center">
                    {/* 3. NOVO BOTÃO DE ACESSO */}
                    <Tooltip title="Acessar Painel">
                      <IconButton onClick={() => handleImpersonate(tenant)}>
                        <LoginIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar Cliente">
                      <IconButton onClick={() => handleOpenModal(tenant)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir Cliente">
                      <IconButton onClick={() => handleDeleteTenant(tenant.id)}>
                        <DeleteIcon color="error" />
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
        plans={plans}
      />
    </Container>
  );
};

export default TenantsPage;