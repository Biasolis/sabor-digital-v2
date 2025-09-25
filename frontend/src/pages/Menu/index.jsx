import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Container, Paper, Grid,
  CircularProgress, Alert, AppBar, Toolbar, Chip, ButtonGroup
} from '@mui/material';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useTenantTheme } from '../../contexts/TenantThemeContext'; // 1. Importar o hook do tema
import CategoryList from './components/CategoryList';
import ProductList from './components/ProductList';

const Menu = () => {
  // 2. Usar o hook para obter as informações do tenant e o status de carregamento
  const { tenantInfo, loading: themeLoading } = useTenantTheme();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      // A busca de tenantInfo já é feita pelo context, então buscamos apenas o resto
      const [categoriesResponse, productsResponse] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
      ]);
      setCategories(categoriesResponse.data);
      setProducts(productsResponse.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Não foi possível carregar o cardápio.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = selectedCategoryId
    ? products.filter(p => categories.find(c => c.id === selectedCategoryId)?.name === p.category_name)
    : products;

  const isLoading = themeLoading || loading;

  return (
    <Box sx={{ display: 'flex' }}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <AppBar position="static" color="default" elevation={1} sx={{ mb: 2 }}>
          <Toolbar>
            {/* 3. Usar os dados do tenantInfo vindos do contexto */}
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              {tenantInfo?.name || 'Cardápio'}
              {!isLoading && (
                <Chip
                  label={tenantInfo?.is_open ? 'Aberto' : 'Fechado'}
                  color={tenantInfo?.is_open ? 'success' : 'error'}
                  size="small"
                />
              )}
            </Typography>
            <ButtonGroup variant="text" color="primary">
              <Button component={Link} to="/customer-login">Acompanhar Comanda</Button>
              <Button component={Link} to="/login">Acesso Restrito</Button>
            </ButtonGroup>
          </Toolbar>
        </AppBar>
        
        {!isLoading && !tenantInfo?.is_open && (
            <Alert severity="warning" sx={{ mb: 2 }}>
                No momento, estamos fechados. O cardápio está disponível apenas para visualização.
            </Alert>
        )}

        {isLoading && ( <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box> )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!isLoading && !error && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom sx={{ pl: 2 }}>Categorias</Typography>
              <Paper elevation={0} variant="outlined">
                <CategoryList categories={categories} selectedCategory={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={9}>
              <ProductList products={filteredProducts} />
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Menu;