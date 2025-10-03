import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Container, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import api from '../../services/api';
import CustomerModal from './components/CustomerModal';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar clientes.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenModal = (customer = null) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingCustomer(null);
    setModalOpen(false);
  }

  const handleSaveCustomer = async (customerData) => {
    const isEditing = !!customerData.id;
    const endpoint = isEditing ? `/customers/${customerData.id}` : '/customers';
    const method = isEditing ? 'put' : 'post';

    try {
      await api[method](endpoint, customerData);
      toast.success(`Cliente ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      handleCloseModal();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar cliente.');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/customers/${customerId}`);
        toast.success('Cliente excluído com sucesso!');
        fetchCustomers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir cliente.');
      }
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">Gerenciamento de Clientes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Novo Cliente</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow hover key={customer.id}>
                  <TableCell>{`${customer.first_name} ${customer.last_name || ''}`}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar"><IconButton onClick={() => handleOpenModal(customer)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Excluir"><IconButton onClick={() => handleDeleteCustomer(customer.id)}><DeleteIcon color="error" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <CustomerModal 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveCustomer} 
        customer={editingCustomer} 
      />
    </Container>
  );
};

export default CustomersPage;