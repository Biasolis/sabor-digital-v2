import { Router } from 'express';
import multer from 'multer';
import { createTenant, getMyTenant, updateMyTenant, listTenants, updateTenant, getPublicTenantInfo } from '../controllers/tenantController.js';
import { protect, isSuperAdmin, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js';
import { resolveTenant } from '../middleware/tenantMiddleware.js'; // Importa o middleware correto

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Rota Pública (não requer token) ---
router.get('/public', resolveTenant, getPublicTenantInfo); // NOVA ROTA PÚBLICA

// --- Rotas para Super Admin ---
router.post('/', protect, isSuperAdmin, createTenant);
router.get('/', protect, isSuperAdmin, listTenants);
router.put('/:id', protect, isSuperAdmin, updateTenant);

// --- Rotas para Usuários do Tenant ---
router.get('/me', protect, isTenantUser, getMyTenant);
router.put('/me', protect, isTenantAdmin, upload.single('logo'), updateMyTenant);

export default router;