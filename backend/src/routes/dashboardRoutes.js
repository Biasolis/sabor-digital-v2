import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, isTenantUser } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas do dashboard são protegidas e para usuários de tenant
router.use(protect, isTenantUser);

// GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

export default router;