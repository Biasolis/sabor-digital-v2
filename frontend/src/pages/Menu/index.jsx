import React, { useState, useEffect } from 'react';
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
import { Link } from 'react-router-dom'; // Para o botão de login
import api from '../../services/api';

// Importando os novos componentes
import CategoryList from './components/CategoryList';
import ProductList from './components/ProductList';

const Menu = () => {
  const [tenantName, setTenantName] = useState('Cardápio Digital');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // Armazena o ID da categoria selecionada

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usamos Promise.all para buscar categorias e produtos em paralelo
        const [categoriesResponse, productsResponse] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
        ]);

        setCategories(categoriesResponse.data);
        setProducts(productsResponse.data);

        // Simplesmente para demonstração, o nome do tenant viria de um endpoint específico no futuro
        const subdomain = api.defaults.headers['X-Tenant-Subdomain'];
        if (subdomain) {
            setTenantName(`Cardápio de ${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)}`);
        }

      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Não foi possível carregar o cardápio.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtra os produtos com base na categoria selecionada
  const filteredProducts = selectedCategoryId
    ? products.filter(p => p.category_name === categories.find(c => c.id === selectedCategoryId)?.name)
    : products;

  return (
    <Box sx={{ display: 'flex' }}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Cabeçalho do Cardápio */}
        <AppBar position="static" color="default" elevation={1} sx={{ mb: 4 }}>
          <Toolbar>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              {tenantName}
            </Typography>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          </Toolbar>
        </AppBar>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!loading && !error && (
          <Grid container spacing={3}>
            {/* Coluna das Categorias */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom sx={{ pl: 2 }}>
                Categorias
              </Typography>
              <Paper elevation={0} variant="outlined">
                <CategoryList
                  categories={categories}
                  selectedCategory={selectedCategoryId}
                  onSelectCategory={setSelectedCategoryId}
                />
              </Paper>
            </Grid>

            {/* Coluna dos Produtos */}
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