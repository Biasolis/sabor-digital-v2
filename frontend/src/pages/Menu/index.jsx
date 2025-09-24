import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
} from '@mui/material';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import CategoryList from './components/CategoryList';
import ProductList from './components/ProductList';

const Menu = () => {
  const [tenantInfo, setTenantInfo] = useState({ name: 'Cardápio Digital', is_open: true });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Usamos a rota pública para buscar as informações do tenant através do header/subdomínio
      const tenantResponse = await api.get('/tenants/public'); // Supondo que esta rota exista para dados públicos
      const [categoriesResponse, productsResponse] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
      ]);

      setTenantInfo(tenantResponse.data);
      setCategories(categoriesResponse.data);
      setProducts(productsResponse.data);

    } catch (err) {
      // Fallback para caso a rota pública do tenant não exista ainda
      // (Buscando dados essenciais de forma separada)
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
            api.get('/categories'),
            api.get('/products'),
        ]);
        setCategories(categoriesResponse.data);
        setProducts(productsResponse.data);
        // Simulação dos dados do tenant
        const subdomain = api.defaults.headers['X-Tenant-Subdomain'];
        setTenantInfo({ name: `Cardápio de ${subdomain}`, is_open: true }); // Assume true se falhar
      } catch (finalError) {
        const errorMessage = finalError.response?.data?.message || 'Não foi possível carregar o cardápio.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = selectedCategoryId
    ? products.filter(p => p.category_name === categories.find(c => c.id === selectedCategoryId)?.name)
    : products;

  return (
    <Box sx={{ display: 'flex' }}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <AppBar position="static" color="default" elevation={1} sx={{ mb: 2 }}>
          <Toolbar>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              {tenantInfo.name}
            </Typography>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          </Toolbar>
        </AppBar>
        
        {!tenantInfo.is_open && (
            <Alert severity="warning" sx={{ mb: 2 }}>
                No momento, estamos fechados e não estamos aceitando novos pedidos.
            </Alert>
        )}

        {loading && ( <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box> )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!loading && !error && (
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