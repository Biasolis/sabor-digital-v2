import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useAuth } from '../../../contexts/AuthContext';
import StatCard from './components/StatCard';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/superadmin/dashboard/stats');
                setStats(response.data);
            } catch (err) {
                const msg = err.response?.data?.message || "Erro ao carregar estatísticas do sistema.";
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 4 }}>
                Dashboard Super Admin
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Total de Clientes"
                        value={stats?.totalTenants || 0}
                        icon={<PeopleIcon />}
                        color="primary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                     <StatCard 
                        title="Clientes Ativos"
                        value={stats?.activeTenants || 0}
                        icon={<CheckCircleIcon />}
                        color="success.main"
                    />
                </Grid>
                 <Grid item xs={12} sm={6} md={4}>
                     <StatCard 
                        title="Planos Cadastrados"
                        value={stats?.totalPlans || 0}
                        icon={<MonetizationOnIcon />}
                        color="warning.main"
                    />
                </Grid>
            </Grid>

            {/* Futuras seções do dashboard podem vir aqui, como gráficos e alertas */}
            
        </Container>
    );
};

export default SuperAdminDashboard;