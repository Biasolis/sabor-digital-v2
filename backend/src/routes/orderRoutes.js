import { Router } from 'express';
import { 
  createOrder, 
  addOrderItem,
  getOrderDetails,
  updateOrderStatus,
  listOrders,
  getOpenOrderByTable,
  removeOrderItem // Nova importação
} from '../controllers/orderController.js';
import { 
  protect, 
  isTenantUser, 
  isOperationalUser,
  isKitchenStaff
} from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, isTenantUser);

router.get('/', listOrders);
router.get('/table/:tableId', getOpenOrderByTable);
router.post('/', isOperationalUser, createOrder);
router.post('/:orderId/items', isOperationalUser, addOrderItem);
router.delete('/:orderId/items/:itemId', isOperationalUser, removeOrderItem); // NOVA ROTA
router.get('/:orderId', getOrderDetails);
router.patch('/:orderId/status', isKitchenStaff, updateOrderStatus);

export default router;