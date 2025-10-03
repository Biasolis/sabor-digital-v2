import { Router } from 'express';
import { createPlan, listPlans, updatePlan, deletePlan } from '../controllers/planController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas de planos são exclusivas para o Super Admin
router.use(protect, isSuperAdmin);

router.get('/', listPlans);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

export default router;