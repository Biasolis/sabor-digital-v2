import { Router } from 'express';
import multer from 'multer';
// Adicionado 'deleteTenant' na importação
import { createTenant, getMyTenant, updateMyTenant, listTenants, updateTenant, getPublicTenantInfo, deleteTenant } from '../controllers/tenantController.js';
import { protect, isSuperAdmin, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js';
import { resolveTenant } from '../middleware/tenantMiddleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Rota Pública (não requer token) ---
router.get('/public', resolveTenant, getPublicTenantInfo);

// --- Rotas para Usuários do Tenant ---
router.get('/me', protect, isTenantUser, getMyTenant);
router.put('/me', protect, isTenantAdmin, upload.single('logo'), updateMyTenant);

// --- Rotas para Super Admin ---
router.post('/', protect, isSuperAdmin, createTenant);
router.get('/', protect, isSuperAdmin, listTenants);
router.put('/:id', protect, isSuperAdmin, updateTenant);
router.delete('/:id', protect, isSuperAdmin, deleteTenant); // NOVA ROTA DE EXCLUSÃO

export default router;