import { Router } from 'express';
import { createCategory, listCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas aqui requerem que o usuário esteja logado e pertença a um tenant
router.use(protect, isTenantUser);

// Rota para listar categorias (qualquer usuário logado da loja pode ver o cardápio)
router.get('/', listCategories);

// Rotas abaixo são apenas para admins da loja (ou caixa, futuramente)
router.post('/', isTenantAdmin, createCategory);
router.put('/:id', isTenantAdmin, updateCategory);
router.delete('/:id', isTenantAdmin, deleteCategory);

export default router;