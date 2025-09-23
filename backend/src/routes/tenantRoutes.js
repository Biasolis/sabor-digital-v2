import { Router } from 'express';
import { createTenant, getMyTenant } from '../controllers/tenantController.js';
import { protect, isSuperAdmin, isTenantUser } from '../middleware/authMiddleware.js';

const router = Router();

// --- Rotas para Super Admin ---
// POST /api/tenants (Cria um novo tenant)
router.post('/', protect, isSuperAdmin, createTenant);

// --- Rotas para Usuários do Tenant ---
// GET /api/tenants/me (Busca os dados do tenant do usuário logado)
router.get('/me', protect, isTenantUser, getMyTenant);

export default router;