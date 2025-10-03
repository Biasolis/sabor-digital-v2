import { Router } from 'express';
import { openSession, closeSession } from '../controllers/cashSessionController.js';
import { protect, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js'; // Usando Admin por enquanto

const router = Router();

router.use(protect, isTenantUser, isTenantAdmin); // Apenas admins (ou caixas, futuramente) podem gerenciar sessões

router.post('/open', openSession);
router.post('/:sessionId/close', closeSession);

export default router;