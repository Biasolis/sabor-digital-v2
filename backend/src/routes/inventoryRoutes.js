import { Router } from 'express';
import { createInventoryItem, listInventoryItems, updateInventoryItem, deleteInventoryItem } from '../controllers/inventoryController.js';
import { protect, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas de estoque são protegidas e específicas para um tenant
router.use(protect, isTenantUser, isTenantAdmin); // Apenas admins podem gerenciar

router.get('/', listInventoryItems);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem); // Nova rota de DELETE

export default router;