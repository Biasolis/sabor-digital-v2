import { Router } from 'express';
import { createSubscriptionAndTenant } from '../controllers/subscriptionController.js';

const router = Router();

// Rota pública para um novo cliente se inscrever e criar um tenant
// POST /api/subscriptions/signup
router.post('/signup', createSubscriptionAndTenant);

export default router;