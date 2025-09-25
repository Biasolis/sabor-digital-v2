import { Router } from 'express';
// Adicionada a nova função 'impersonateTenant'
import { login, getMe, impersonateTenant } from '../controllers/superadminController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Rota pública
router.post('/login', login);

// Rota protegida
// GET /api/superadmin/me
// A requisição primeiro passará pelo 'protect', depois pelo 'isSuperAdmin', e só então chegará em 'getMe'
router.get('/me', protect, isSuperAdmin, getMe);

// NOVA ROTA para o Super Admin acessar um tenant
router.post('/impersonate/:tenantId', protect, isSuperAdmin, impersonateTenant);


export default router;