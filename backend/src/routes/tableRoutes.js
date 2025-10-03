import { Router } from 'express';
import { createTable, listTables, deleteTable } from '../controllers/tableController.js';
import { protect, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas aqui requerem que o usuário esteja logado e pertença a um tenant
router.use(protect, isTenantUser);

// Qualquer usuário da loja (incluindo garçom) pode ver a lista de mesas
router.get('/', listTables);

// Apenas admins podem criar ou deletar mesas
router.post('/', isTenantAdmin, createTable);
router.delete('/:id', isTenantAdmin, deleteTable);

export default router;