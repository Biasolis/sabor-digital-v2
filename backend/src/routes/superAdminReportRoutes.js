import { Router } from 'express';
import { getPlatformReports } from '../controllers/superAdminReportController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas de relatórios do Super Admin são protegidas
router.use(protect, isSuperAdmin);

router.get('/', getPlatformReports);

export default router;