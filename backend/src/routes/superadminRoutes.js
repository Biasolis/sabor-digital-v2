import { Router } from 'express';
import { login, getMe } from '../controllers/superadminController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Rota pública
router.post('/login', login);

// Rota protegida
// GET /api/superadmin/me
// A requisição primeiro passará pelo 'protect', depois pelo 'isSuperAdmin', e só então chegará em 'getMe'
router.get('/me', protect, isSuperAdmin, getMe);

export default router;