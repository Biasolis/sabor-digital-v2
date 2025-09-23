import { Router } from 'express';
import { createInventoryItem, listInventoryItems, updateInventoryItem } from '../controllers/inventoryController.js';
import { protect, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js'; // Usaremos isTenantAdmin por enquanto

const router = Router();

// Todas as rotas de estoque são protegidas e específicas para um tenant
router.use(protect, isTenantUser);

// Apenas admins (e futuramente caixas) podem gerenciar o estoque
router.get('/', isTenantAdmin, listInventoryItems);
router.post('/', isTenantAdmin, createInventoryItem);
router.put('/:id', isTenantAdmin, updateInventoryItem);
// A rota de DELETE pode ser adicionada aqui se necessário

export default router;