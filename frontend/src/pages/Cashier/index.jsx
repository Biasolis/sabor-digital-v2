import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import api from '../../services/api';
import OpenSessionModal from './components/OpenSessionModal';
import CloseSessionModal from './components/CloseSessionModal';
import CashRegisterModal from './components/CashRegisterModal'; // Importa o novo modal

const CashierPage = () => {
  const [cashRegisters, setCashRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState(null);

  const fetchCashRegisters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/cash-registers');
      setCashRegisters(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar os caixas.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCashRegisters();
  }, [fetchCashRegisters]);
  
  const handleOpenModal = (register) => {
    setSelectedRegister(register);
    setIsOpenModalOpen(true);
  };
  
  const handleCloseModal = (register) => {
    setSelectedRegister(register);
    setIsCloseModalOpen(true);
  };

  const handleSaveRegister = async (name) => {
    try {
      await api.post('/cash-registers', { name });
      toast.success(`Caixa "${name}" criado com sucesso!`);
      setIsRegisterModalOpen(false);
      fetchCashRegisters();
    } catch (error) {
       toast.error(error.response?.data?.message || 'Não foi possível criar o caixa.');
    }
  };

  const handleOpenSession = async (openingBalance) => {
    try {
      await api.post('/cash-sessions/open', {
        cash_register_id: selectedRegister.id,
        opening_balance: openingBalance,
      });
      toast.success('Sessão de caixa iniciada com sucesso!');
      setIsOpenModalOpen(false);
      fetchCashRegisters();
    } catch (error) {
       toast.error(error.response?.data?.message || 'Não foi possível abrir a sessão.');
    }
  };
  
  const handleCloseSession = async (closingBalance) => {
    try {
      await api.post(`/cash-sessions/${selectedRegister.open_session_id}/close`, {
        closing_balance: closingBalance,
      });
      toast.success('Sessão de caixa fechada com sucesso!');
      setIsCloseModalOpen(false);
      fetchCashRegisters();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Não foi possível fechar a sessão.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">
          Gerenciamento de Caixa
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsRegisterModalOpen(true)}>
          Novo Caixa
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {cashRegisters.map((register) => (
          <Grid item key={register.id} xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PointOfSaleIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h5">{register.name}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'center' }}>
                 <Typography color="text.secondary" sx={{mb: 2, textTransform: 'capitalize'}}>
                   Status: {register.session_status === 'open' ? 'Aberto' : 'Fechado'}
                 </Typography>
                 {register.session_status === 'open' ? (
                   <Button 
                      variant="contained" 
                      color="error"
                      startIcon={<LockIcon />}
                      onClick={() => handleCloseModal(register)}
                   >
                      Fechar Caixa
                   </Button>
                 ) : (
                   <Button 
                      variant="contained" 
                      startIcon={<LockOpenIcon />}
                      onClick={() => handleOpenModal(register)}
                   >
                      Abrir Caixa
                   </Button>
                 )}
              </Box>
            </Paper>
          </Grid>
        ))}
        {cashRegisters.length === 0 && !loading && (
             <Grid item xs={12}>
                <Paper sx={{p: 3, textAlign: 'center'}}>
                    <Typography color="text.secondary">Nenhum caixa cadastrado. Clique em "Novo Caixa" para começar.</Typography>
                </Paper>
            </Grid>
        )}
      </Grid>
      
      <CashRegisterModal
        open={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSave={handleSaveRegister}
      />
      
      <OpenSessionModal
        open={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        onSave={handleOpenSession}
      />
      
      <CloseSessionModal
        open={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onSave={handleCloseSession}
      />
    </Container>
  );
};

export default CashierPage;