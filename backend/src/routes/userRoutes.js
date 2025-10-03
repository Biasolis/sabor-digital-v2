import { Router } from 'express';
import { createUser, listUsers, updateUser } from '../controllers/userController.js';
import { protect, isTenantUser, isTenantAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas aqui requerem que o usuário esteja logado e pertença a um tenant
router.use(protect, isTenantUser);

// Rota para listar usuários (qualquer usuário do tenant pode ver a equipe)
router.get('/', listUsers);

// Apenas o admin do tenant pode criar ou atualizar usuários
router.post('/', isTenantAdmin, createUser);
router.put('/:id', isTenantAdmin, updateUser); // NOVA ROTA DE UPDATE

// Adicione aqui futuramente a rota de Delete (DELETE)
// Ex: router.delete('/:id', isTenantAdmin, deleteUser);

export default router;