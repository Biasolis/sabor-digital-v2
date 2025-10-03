import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, CircularProgress, Alert } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { toast } from 'react-toastify';
import StatCard from './components/StatCard';
import api from '../../../services/api';

const SuperAdminReports = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/superadmin/reports');
                setReportData(response.data);
            } catch (err) {
                const msg = err.response?.data?.message || "Erro ao carregar relatórios.";
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
        style: 'currency', currency: 'BRL'
    }).format(value);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const summary = reportData?.summary || {};

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 4 }}>
                Relatórios da Plataforma
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Faturamento Total"
                        value={formatCurrency(summary.totalRevenue || 0)}
                        icon={<MonetizationOnIcon />}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                     <StatCard 
                        title="Total de Pedidos Pagos"
                        value={summary.totalOrders || 0}
                        icon={<ReceiptLongIcon />}
                        color="primary.main"
                    />
                </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                     <StatCard 
                        title="Total de Clientes (Tenants)"
                        value={summary.totalTenants || 0}
                        icon={<PeopleIcon />}
                        color="secondary.main"
                    />
                </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                     <StatCard 
                        title="Novos Clientes (Últimos 30 dias)"
                        value={summary.newTenantsLast30Days || 0}
                        icon={<PersonAddIcon />}
                        color="info.main"
                    />
                </Grid>
            </Grid>

            {/* Futuramente, esta área pode conter gráficos de faturamento mensal, etc. */}
            
        </Container>
    );
};

export default SuperAdminReports;