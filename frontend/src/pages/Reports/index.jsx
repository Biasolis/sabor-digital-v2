import React, { useState } from 'react';
import {
  Box, Typography, Container, Paper, TextField, Button, Grid, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      const response = await api.get('/reports/sales', {
        params: { startDate, endDate },
      });
      setReportData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDateTime = (date) => new Date(date).toLocaleString('pt-BR');

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ my: 4 }}>Relatório de Vendas</Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Data de Início"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Data de Fim"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="contained" onClick={handleGenerateReport} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Gerar Relatório'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {reportData && (
        <Paper>
          <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6">Resumo do Período</Typography>
            <Box sx={{ display: 'flex', gap: 4, mt: 1 }}>
              <Typography><b>Vendas Totais:</b> {formatCurrency(reportData.summary.totalRevenue)}</Typography>
              <Typography><b>Total de Transações:</b> {reportData.summary.totalTransactions}</Typography>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Comanda</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Método de Pagamento</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDateTime(tx.created_at)}</TableCell>
                    <TableCell>{tx.order_id?.substring(0, 8) || 'N/A'}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell sx={{textTransform: 'capitalize'}}>{tx.payment_method?.replace('_', ' ')}</TableCell>
                    <TableCell align="right">{formatCurrency(tx.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
       {reportData && reportData.transactions.length === 0 && (
          <Alert severity="info" sx={{mt: 2}}>Nenhuma transação encontrada para o período selecionado.</Alert>
      )}

    </Container>
  );
};

export default ReportsPage;