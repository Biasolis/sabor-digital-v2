import { Router } from 'express';
import { createCashRegister, listCashRegisters } from '../controllers/cashRegisterController.js';
import { protect, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, isTenantUser, isTenantAdmin); // Apenas admins podem gerenciar caixas

router.post('/', createCashRegister);
router.get('/', listCashRegisters);

export default router;