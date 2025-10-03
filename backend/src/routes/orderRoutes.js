import { Router } from 'express';
import { 
  createOrder, 
  addOrderItem,
  getOrderDetails,
  updateOrderStatus,
  listOrders,
  getOpenOrderByTable,
  removeOrderItem,
  getMyActiveOrder,
  linkCustomerToOrder // Nova importação
} from '../controllers/orderController.js';
import { 
  protect, 
  isTenantUser, 
  isOperationalUser,
  isKitchenStaff
} from '../middleware/authMiddleware.js';
import { protectCustomer } from '../middleware/customerAuthMiddleware.js';

const router = Router();

// ROTA PARA CLIENTES LOGADOS
router.get('/my-active-order', protectCustomer, getMyActiveOrder);


// ROTAS PARA FUNCIONÁRIOS LOGADOS
router.use(protect, isTenantUser);

router.get('/', listOrders);
router.get('/table/:tableId', getOpenOrderByTable);
router.post('/', isOperationalUser, createOrder);

// NOVA ROTA para vincular cliente
router.post('/:orderId/customer', isOperationalUser, linkCustomerToOrder);

router.post('/:orderId/items', isOperationalUser, addOrderItem);
router.delete('/:orderId/items/:itemId', isOperationalUser, removeOrderItem);
router.get('/:orderId', getOrderDetails);
router.patch('/:orderId/status', isKitchenStaff, updateOrderStatus);

export default router;