import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

// Função para formatar os valores do eixo Y como moeda
const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const SalesChart = ({ data }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
      <Typography variant="h6" gutterBottom>
        Vendas nos Últimos 7 Dias
      </Typography>
      <Box sx={{ height: 'calc(100% - 30px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} name="Vendas (R$)" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default SalesChart;