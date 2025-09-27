import { Router } from 'express';
import { login, getMe, updateSuperAdminProfile } from '../controllers/superadminController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Rota pública
router.post('/login', login);

// Rotas protegidas
router.get('/me', protect, isSuperAdmin, getMe);
router.put('/profile', protect, isSuperAdmin, updateSuperAdminProfile); // NOVA ROTA

export default router;