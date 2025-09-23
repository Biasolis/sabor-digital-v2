import { Router } from 'express';
import { 
  createOrder, 
  addOrderItem,
  getOrderDetails,
  updateOrderStatus,
  listOrders // Nova importação
} from '../controllers/orderController.js';
import { 
  protect, 
  isTenantUser, 
  isOperationalUser,
  isKitchenStaff
} from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas aqui requerem que o usuário esteja logado e pertença a um tenant
router.use(protect, isTenantUser);

// Rota para listar todas as comandas (usada pela cozinha)
router.get('/', listOrders);

// Rotas para equipe operacional (Garçom, Caixa, Admin)
router.post('/', isOperationalUser, createOrder);
router.post('/:orderId/items', isOperationalUser, addOrderItem);

// Qualquer usuário da loja pode ver os detalhes de uma comanda
router.get('/:orderId', getOrderDetails);

// Apenas Cozinha, Caixa e Admin podem mudar o status
router.patch('/:orderId/status', isKitchenStaff, updateOrderStatus);


export default router;