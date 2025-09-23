import { Router } from 'express';
import { createUser, listUsers } from '../controllers/userController.js';
import { protect, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas aqui requerem que o usuário esteja logado e pertença a um tenant
router.use(protect, isTenantUser);

// Rota para listar usuários (qualquer usuário do tenant pode ver a equipe)
router.get('/', listUsers);

// Rota para criar um novo usuário (apenas o admin do tenant pode criar)
router.post('/', isTenantAdmin, createUser);

// Adicione aqui futuramente as rotas de Update (PUT) e Delete (DELETE)
// Ex: router.put('/:id', isTenantAdmin, updateUser);
// Ex: router.delete('/:id', isTenantAdmin, deleteUser);

export default router;