import { Router } from 'express';
import { createCategory, listCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js';
import { resolveTenant } from '../middleware/tenantMiddleware.js';

const router = Router();

// Rota para listar categorias (PÚBLICA, identificada pelo header)
router.get('/', resolveTenant, listCategories);

// Todas as rotas ABAIXO requerem que o usuário esteja logado e pertença a um tenant
router.use(protect, isTenantUser);

// Rotas de escrita são apenas para admins da loja
router.post('/', isTenantAdmin, createCategory);
router.put('/:id', isTenantAdmin, updateCategory);
router.delete('/:id', isTenantAdmin, deleteCategory);

export default router;