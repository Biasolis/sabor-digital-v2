import { Router } from 'express';
import { getSalesReport } from '../controllers/reportController.js';
import { protect, isTenantAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Apenas administradores da loja podem acessar os relatórios
router.use(protect, isTenantAdmin);

router.get('/sales', getSalesReport);

export default router;