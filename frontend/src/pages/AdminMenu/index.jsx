import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Container, Paper, Grid, CircularProgress, Alert,
  IconButton, Tooltip, useTheme, useMediaQuery, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { toast } from 'react-toastify';
import api from '../../services/api';

import ProductCard from '../../pages/Menu/components/ProductCard';
import CategoryModal from './components/CategoryModal';
import ProductModal from './components/ProductModal';
import RecipeModal from './components/RecipeModal';

const AdminMenu = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all'); // 'all' para "Todos os Produtos"

  // Estados para controlar os modais
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isRecipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedProductForRecipe, setSelectedProductForRecipe] = useState(null);
  
  // Hook para detectar o tamanho da tela
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchData = useCallback(async () => {
    try {
      const [categoriesResponse, productsResponse, inventoryResponse] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
        api.get('/inventory'),
      ]);
      setCategories(categoriesResponse.data);
      setProducts(productsResponse.data);
      setInventoryItems(inventoryResponse.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Não foi possível carregar os dados.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenRecipeModal = (product) => {
    setSelectedProductForRecipe(product);
    setRecipeModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (categoryData.id) {
        await api.put(`/categories/${categoryData.id}`, { name: categoryData.name });
        toast.success('Categoria atualizada!');
      } else {
        await api.post('/categories', { name: categoryData.name });
        toast.success('Categoria criada!');
      }
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar categoria.');
    } finally {
      setCategoryModalOpen(false);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Atenção: Excluir uma categoria não remove seus produtos. Mova-os para outra categoria antes de excluir.')) {
      try {
        await api.delete(`/categories/${categoryId}`);
        toast.success('Categoria excluída!');
        await fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir categoria.');
      }
    }
  };

  const handleSaveProduct = async (productData, imageFile) => {
    const isEditing = !!productData.id;
    const endpoint = isEditing ? `/products/${productData.id}` : '/products';
    const method = isEditing ? 'put' : 'post';
    
    try {
      const response = await api[method](endpoint, productData);
      const savedProduct = response.data;
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        await api.post(`/products/${savedProduct.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success(`Produto ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar produto.');
    } finally {
      setProductModalOpen(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/products/${productId}`);
        toast.success('Produto excluído com sucesso!');
        await fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir produto.');
      }
    }
  };


  const filteredProducts = selectedCategoryId !== 'all'
    ? products.filter(p => p.category_id === selectedCategoryId)
    : products;

  const renderCategories = () => {
    // Renderização para Mobile/Tablet (Abas)
    if (isMobile) {
      return (
        <Paper elevation={2} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, pl:2 }}>
            <Typography variant="h6">Categorias</Typography>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }}>
              Nova
            </Button>
          </Box>
          <Tabs
            value={selectedCategoryId}
            onChange={(e, newValue) => setSelectedCategoryId(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Todos os Produtos" value="all" />
            {categories.map(cat => (
              <Tab key={cat.id} label={cat.name} value={cat.id} />
            ))}
          </Tabs>
        </Paper>
      );
    }

    // Renderização para Desktop (Lista Lateral)
    return (
      <Grid item xs={12} md={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Categorias</Typography>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }}>
            Nova
          </Button>
        </Box>
        <Paper elevation={2}>
          <Box sx={{ borderBottom: '1px solid #eee' }}>
              <Typography 
                  onClick={() => setSelectedCategoryId('all')}
                  sx={{ p: 2, cursor: 'pointer', fontWeight: selectedCategoryId === 'all' ? 'bold' : 'normal', bgcolor: selectedCategoryId === 'all' ? 'action.selected' : 'transparent' }}
              >
                  Todos os Produtos
              </Typography>
          </Box>
          {categories.map(cat => (
            <Box key={cat.id} sx={{ display: 'flex', alignItems: 'center', '&:hover .actions': { opacity: 1 }, borderBottom: '1px solid #eee' }}>
              <Typography onClick={() => setSelectedCategoryId(cat.id)} sx={{ flexGrow: 1, cursor: 'pointer', p: 2, bgcolor: selectedCategoryId === cat.id ? 'action.selected' : 'transparent', fontWeight: selectedCategoryId === cat.id ? 'bold' : 'normal' }}>
                {cat.name}
              </Typography>
              <Box className="actions" sx={{ opacity: 0, pr: 1, transition: 'opacity 0.2s' }}>
                <IconButton size="small" onClick={() => { setEditingCategory(cat); setCategoryModalOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => handleDeleteCategory(cat.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            </Box>
          ))}
        </Paper>
      </Grid>
    );
  };
  
  const renderProducts = () => (
     <Grid item xs={12} md={isMobile ? 12 : 9}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Produtos</Typography>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}>
            Novo Produto
          </Button>
        </Box>
        <Grid container spacing={3}>
          {filteredProducts.map(product => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                 <Box sx={{ position: 'relative', '&:hover .actions': { opacity: 1 } }}>
                      <ProductCard product={product} />
                      <Paper className="actions" sx={{ position: 'absolute', top: 8, right: 8, opacity: 0, transition: 'opacity 0.2s', borderRadius: '50px' }}>
                          <Tooltip title="Editar Produto"><IconButton size="small" onClick={() => { setEditingProduct(product); setProductModalOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Ficha Técnica"><IconButton size="small" onClick={() => handleOpenRecipeModal(product)}><ReceiptLongIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Excluir Produto"><IconButton size="small" onClick={() => handleDeleteProduct(product.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </Paper>
                 </Box>
              </Grid>
          ))}
          </Grid>
           {filteredProducts.length === 0 && (
              <Paper sx={{p: 3, textAlign: 'center', width: '100%', mt: 2}}>
                  <Typography color="text.secondary">Nenhum produto para exibir. Que tal adicionar um novo?</Typography>
              </Paper>
          )}
      </Grid>
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">
          Gerenciamento de Cardápio
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isMobile ? (
        <>
          {renderCategories()}
          {renderProducts()}
        </>
      ) : (
        <Grid container spacing={4}>
          {renderCategories()}
          {renderProducts()}
        </Grid>
      )}
      
      <CategoryModal open={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} onSave={handleSaveCategory} category={editingCategory} />
      <ProductModal open={isProductModalOpen} onClose={() => setProductModalOpen(false)} onSave={handleSaveProduct} product={editingProduct} categories={categories} />
      
      <RecipeModal 
        open={isRecipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        product={selectedProductForRecipe}
        inventoryItems={inventoryItems}
      />
    </Container>
  );
};

export default AdminMenu;