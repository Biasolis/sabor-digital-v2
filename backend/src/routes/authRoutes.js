import { Router } from 'express';
import { login } from '../controllers/authController.js';

const router = Router();

// Rota de login para usuários de tenants
// POST /api/auth/login
router.post('/login', login);

export default router;