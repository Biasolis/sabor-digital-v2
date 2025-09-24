import { Router } from 'express';
import { getSystemStats } from '../controllers/superAdminDashboardController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas aqui são exclusivas para o Super Admin
router.use(protect, isSuperAdmin);

// GET /api/superadmin/dashboard/stats
router.get('/stats', getSystemStats);

export default router;