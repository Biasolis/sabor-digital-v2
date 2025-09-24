import { Router } from 'express';
import { registerCustomer, loginCustomer } from '../controllers/customerAuthController.js';
import { resolveTenant } from '../middleware/tenantMiddleware.js';

const router = Router();

// Todas as rotas de autenticação do cliente dependem do subdomínio
router.use(resolveTenant);

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

export default router;